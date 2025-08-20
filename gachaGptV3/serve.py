#!/usr/bin/env python3
import http.server
import socketserver
import os

# 현재 디렉토리에서 HTTP 서버 실행
PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"HTTP 서버가 포트 {PORT}에서 실행 중입니다.")
    print(f"테스트 러너: http://localhost:{PORT}/test-runner.html")
    print(f"서버 체크: http://localhost:{PORT}/server-check.html")
    print("Ctrl+C로 서버를 중지할 수 있습니다.")
    httpd.serve_forever()