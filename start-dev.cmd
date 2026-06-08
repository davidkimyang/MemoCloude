@echo off
cd /d C:\CodexProject\MemoCloude
"C:\Program Files\nodejs\node.exe" "C:\CodexProject\MemoCloude\node_modules\next\dist\bin\next" dev -H 127.0.0.1 -p 3000 > dev-server.log 2>&1
