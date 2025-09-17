@echo off
REM Kill any existing Edge processes to ensure clean start
taskkill /F /IM msedge.exe >nul 2>&1

REM Wait a moment for processes to fully terminate
timeout /t 1 /nobreak >nul

REM Launch Edge with fullscreen for touch screen kiosk
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" ^
  --start-fullscreen ^
  --force-device-scale-factor=0.65 ^
  --disable-pinch ^
  --overscroll-history-navigation=0 ^
  --disable-features=TouchpadOverscrollHistoryNavigation,Windows10TabSearch,TabHoverCards,SpatialNavigation,TranslateUI ^
  --disable-threaded-scrolling ^
  --disable-gesture-editing ^
  --disable-gesture-typing ^
  --disable-touchpad-three-finger-click ^
  --disable-touch-adjustment ^
  --disable-touchpad-smooth-scrolling ^
  --disable-touch-feedback-for-pinch ^
  --disable-touch-feedback-for-scroll ^
  --disable-background-mode ^
  --disable-web-security ^
  --disable-features=VizDisplayCompositor ^
  --no-first-run ^
  --kiosk "http://localhost:3000" ^