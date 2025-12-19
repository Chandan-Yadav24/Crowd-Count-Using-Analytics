class StreamingService {
  private activeStreams: Map<number, AbortController> = new Map();

  async startStream(videoId: number, username: string, zones: any[]) {
    if (this.activeStreams.has(videoId)) {
      return;
    }

    const controller = new AbortController();
    this.activeStreams.set(videoId, controller);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analysis/start/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId, username }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedFrameData: any[] = [];
      let maxCounts: any = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim() || !part.includes('data:')) continue;
          try {
            const jsonStr = part.replace(/^data: /, '').trim();
            if (!jsonStr || jsonStr.length < 2) continue;
            const data = JSON.parse(jsonStr);

            if (data.error) {
              console.error('Stream error:', data.error);
              break;
            }

            if (data.complete) {
              const completedAnalysis = {
                id: -Date.now(),
                video_id: videoId,
                video_filename: `Video ${videoId}`,
                total_count: data.total_count || Object.values(maxCounts).reduce((sum: number, count: any) => sum + count, 0),
                zone_counts: data.zone_counts || Object.entries(maxCounts).map(([label, count]) => ({
                  zone_id: zones.find((z: any) => z.label === label)?.id || 0,
                  zone_label: label,
                  count
                })),
                processed_at: new Date().toISOString(),
                frame_data: accumulatedFrameData
              };

              localStorage.setItem(`session_analysis_${videoId}`, JSON.stringify(completedAnalysis));
              localStorage.removeItem(`live_stream_${videoId}`);
              this.activeStreams.delete(videoId);
              break;
            }

            if (data.counts) {
              if (data.frame_number && data.total_frames) {
                const frameTime = (data.frame_number / data.total_frames) * 10;
                accumulatedFrameData.push({ time: frameTime, counts: data.counts });
              }

              Object.entries(data.counts).forEach(([zone, count]: [string, any]) => {
                if (!maxCounts[zone] || count > maxCounts[zone]) {
                  maxCounts[zone] = count;
                }
              });
            }

            const liveData = {
              videoId,
              video_filename: `Video ${videoId}`,
              username,
              status: 'active',
              progress: data.progress || 0,
              liveCounts: data.counts || {},
              maxCounts,
              currentFrame: data.frame || '',
              frame_data: accumulatedFrameData,
              zone_counts: Object.entries(maxCounts).map(([label, count]) => ({
                zone_id: zones.find((z: any) => z.label === label)?.id || 0,
                zone_label: label,
                count
              })),
              total_count: Object.values(maxCounts).reduce((sum: number, count: any) => sum + count, 0),
              timestamp: Date.now()
            };
            localStorage.setItem(`live_stream_${videoId}`, JSON.stringify(liveData));
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
      }
    } finally {
      localStorage.removeItem(`live_stream_${videoId}`);
      this.activeStreams.delete(videoId);
    }
  }

  stopStream(videoId: number) {
    const controller = this.activeStreams.get(videoId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(videoId);
      localStorage.removeItem(`live_stream_${videoId}`);
    }
  }

  isStreaming(videoId: number): boolean {
    return this.activeStreams.has(videoId);
  }
}

export const streamingService = new StreamingService();
