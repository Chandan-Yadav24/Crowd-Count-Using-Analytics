import cv2
import numpy as np
from typing import List, Dict
import torch
import imageio_ffmpeg

# Monkey patch torch.load to use weights_only=False for YOLO
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    kwargs.setdefault('weights_only', False)
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

class YOLOService:
    def __init__(self):
        self.model = None
        self.progress = {}
    
    def _load_model(self):
        """Lazy load YOLO model"""
        if self.model is None:
            from ultralytics import YOLO
            self.model = YOLO('yolov8n.pt')
    
    def point_in_polygon(self, point, polygon):
        """Check if point is inside polygon"""
        x, y = point
        n = len(polygon)
        inside = False
        p1x, p1y = polygon[0]
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        return inside
    
    def analyze_video(self, video_path: str, zones: List[Dict], output_path: str) -> Dict:
        """Process video with YOLO detections and count people in zones"""
        self._load_model()
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception("Cannot open video file")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        print(f"Video dimensions: {width}x{height}")
        
        # Scale zones from normalized 640x360 to actual video dimensions
        scaled_zones = []
        for zone in zones:
            scaled_coords = []
            for x, y in zone['coordinates']:
                scaled_x = int((x / 640) * width)
                scaled_y = int((y / 360) * height)
                scaled_coords.append([scaled_x, scaled_y])
            scaled_zones.append({
                'id': zone['id'],
                'label': zone['label'],
                'coordinates': scaled_coords
            })
        
        print(f"Scaled zones: {scaled_zones}")
        
        # Use imageio-ffmpeg for web-compatible H.264 encoding
        import imageio
        writer = imageio.get_writer(output_path, fps=fps, codec='libx264', pixelformat='yuv420p')
        
        # Initialize zone counters
        zone_max_counts = {zone['id']: 0 for zone in scaled_zones}
        total_people = 0
        frame_count = 0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Store progress
        progress_key = f"video_{video_path}"
        self.progress[progress_key] = {'current': 0, 'total': total_frames, 'percentage': 0}
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Update progress
            percentage = int((frame_count / total_frames) * 100)
            self.progress[progress_key] = {'current': frame_count, 'total': total_frames, 'percentage': percentage}
            
            # Run YOLO detection (only detect people - class 0)
            results = self.model(frame, classes=[0], verbose=False)
            
            # Draw zones FIRST (static) using scaled coordinates
            for zone in scaled_zones:
                pts = np.array(zone['coordinates'], np.int32).reshape((-1, 1, 2))
                cv2.polylines(frame, [pts], True, (0, 255, 0), 3)
                cv2.putText(frame, zone['label'], tuple(zone['coordinates'][0]), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Count people in zones
            frame_zone_counts = {zone['id']: 0 for zone in scaled_zones}
            
            for result in results:
                for box in result.boxes:
                    # Get person bounding box
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    center_x = int((x1 + x2) / 2)
                    center_y = int((y1 + y2) / 2)
                    
                    # Draw bounding box for person
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)
                    cv2.putText(frame, 'Person', (int(x1), int(y1) - 10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                    
                    # Check which zone this person is in
                    for zone in scaled_zones:
                        if self.point_in_polygon((center_x, center_y), zone['coordinates']):
                            frame_zone_counts[zone['id']] += 1
                            # Draw red dot for person in zone
                            cv2.circle(frame, (center_x, center_y), 5, (0, 0, 255), -1)
                            break
            
            # Update max counts
            for zone_id, count in frame_zone_counts.items():
                if count > zone_max_counts[zone_id]:
                    zone_max_counts[zone_id] = count
            
            # Convert BGR to RGB for imageio
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            writer.append_data(rgb_frame)
        
        cap.release()
        writer.close()
        
        # Calculate results
        zone_results = []
        total_count = 0
        for zone in scaled_zones:
            count = zone_max_counts[zone['id']]
            zone_results.append({
                'zone_id': zone['id'],
                'zone_label': zone['label'],
                'count': count
            })
            total_count += count
        
        print(f"Detection complete! Results saved to {output_path}")
        
        return {
            'total_count': total_count,
            'zone_counts': zone_results,
            'output_video': output_path
        }

# Singleton instance
yolo_service = YOLOService()
