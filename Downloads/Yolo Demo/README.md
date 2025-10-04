# 🏋️ Advanced Exercise Tracker

AI-powered exercise tracking system using YOLO pose estimation for real-time form analysis and feedback.

## 🎯 Features

- **Real-time Pose Detection**: Uses YOLO11-pose for accurate body keypoint tracking
- **Exercise Analysis**: Advanced bicep curl form analysis with angle tracking
- **Range of Motion**: Comprehensive ROM analysis and movement quality scoring
- **Data Export**: Export session data and analytics to CSV files
- **Multi-arm Support**: Track left arm, right arm, or both simultaneously
- **Live Feedback**: Real-time form coaching and rep counting

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Webcam for real-time tracking
- Git (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Yolo-Demo
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv .venv
   
   # On Windows:
   .venv\Scripts\activate
   
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the exercise tracker**
   ```bash
   python advanced_bicep_tracker.py
   ```

## 🎮 Controls

- **`q`** - Quit the application
- **`r`** - Reset current session
- **`s`** - Switch between left/right/both arms
- **`a`** - Toggle analytics display
- **`e`** - Export session data to CSV

## 📁 Project Structure

```
Yolo Demo/
├── ml/                          # 🤖 Machine Learning Module
│   ├── models/
│   │   ├── advanced_bicep_tracker.py  # Advanced bicep curl analysis
│   │   └── exercise_tracker.py        # Basic exercise tracking
│   ├── tests/
│   │   ├── test_torch.py              # PyTorch installation test
│   │   └── test_yolo.py               # YOLO detection test
│   ├── utils/                         # ML utility functions
│   ├── requirements.txt               # ML-specific dependencies
│   └── README.md                      # ML module documentation
├── advanced_bicep_tracker.py          # Main application (root level)
├── requirements.txt                   # Project dependencies
├── setup.sh / setup.bat              # Easy setup scripts
├── README.md                          # This file
└── .venv/                             # Virtual environment
```

## 🛠️ Troubleshooting

### Common Issues

1. **"No module named 'ultralytics'"**
   - Make sure you've activated your virtual environment
   - Run: `pip install -r requirements.txt`

2. **Webcam not detected**
   - Check if your camera is being used by another application
   - Try changing the camera index in the code (cv2.VideoCapture(1) instead of 0)

3. **YOLO model download issues**
   - The first run will download the YOLO11n-pose model (~6MB)
   - Ensure you have internet connection

### Performance Tips

- **For better performance**: Close other applications using your webcam
- **For smoother tracking**: Ensure good lighting conditions
- **For accurate analysis**: Position yourself so your full upper body is visible

## 🔧 Advanced Configuration

You can modify these settings in `advanced_bicep_tracker.py`:

```python
# Camera settings
CAMERA_INDEX = 0  # Change if you have multiple cameras

# Detection confidence
CONFIDENCE_THRESHOLD = 0.5  # Lower = more detections, Higher = more accurate

# Analysis sensitivity
ANGLE_SMOOTHING = 5  # Higher = smoother but less responsive
```

## 📊 Data Export

Session data is exported as CSV files with:
- Timestamp
- Rep count
- Arm angles
- Range of motion metrics
- Form scores
- Movement quality analysis

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests!

## 📄 License

This project is open source and available under the MIT License.