@echo off
chcp 65001 > nul
title Serveur Local - AG Résidence Le Floréal 2026
echo ========================================================
echo   Lancement du serveur local pour l'AG Résidence Le Floréal
echo ========================================================
echo.

python -c "import socket, subprocess, webbrowser, http.server, socketserver; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); ip = s.getsockname()[0]; s.close(); port = 8080; print(f'Adresse accessible depuis vos smartphones (meme Wi-Fi) : http://{ip}:{port}'); webbrowser.open(f'http://{ip}:{port}'); httpd = socketserver.TCPServer(('', port), http.server.SimpleHTTPRequestHandler); print('Serveur actif ! Ne fermez pas cette fenetre pendant la seance.'); httpd.serve_forever()"

pause
