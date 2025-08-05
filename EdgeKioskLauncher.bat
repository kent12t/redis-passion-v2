@echo off
REM Kill any existing Edge processes
taskkill /F /IM msedge.exe

REM Launch Edge with kiosk mode and various flags to disable unwanted features
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" ^
  --kiosk "http://rediscover-passion.vercel.app" ^
  --edge-kiosk-type=fullscreen ^
  --disable-pinch ^
  --overscroll-history-navigation=0 ^
  --disable-features=TouchpadOverscrollHistoryNavigation ^
  --disable-threaded-scrolling ^
  --disable-gesture-editing ^
  --disable-gesture-typing ^
  --disable-touchpad-three-finger-click ^
  --disable-touch-adjustment ^
  --disable-touch-drag-drop ^
  --disable-pull-to-refresh ^
  --disable-touchpad-smooth-scrolling ^
  --disable-touch-feedback-for-pinch ^
  --disable-touch-feedback-for-scroll ^
  --disable-features=Windows10TabSearch ^
  --disable-features=TabHoverCards ^
  --disable-features=SpatialNavigation ^
  --disable-features=TranslateUI ^
  --disable-background-mode ^
  --no-first-run