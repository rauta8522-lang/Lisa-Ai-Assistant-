#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys


def run(cmd):
    try:
        completed = subprocess.run(cmd, shell=True, check=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return completed.returncode == 0, completed.stdout.strip() or completed.stderr.strip()
    except Exception as e:
        return False, str(e)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--action', required=True)
    parser.add_argument('--payload', default='{}')
    args = parser.parse_args()

    try:
        payload = json.loads(args.payload)
    except Exception:
        payload = {}

    action = args.action
    desktop = os.path.join(os.path.expanduser('~'), 'Desktop')

    # Map actions to commands
    if action == 'open-desktop-folder':
        try:
            if os.name == 'nt' and hasattr(os, 'startfile'):
                os.startfile(desktop)
                print(json.dumps({'success': True, 'message': 'Desktop folder opened.'}))
            else:
                success, out = run(f'xdg-open "{desktop}"')
                print(json.dumps({'success': success, 'message': out}))
        except Exception as e:
            success, out = run(f'explorer "{desktop}"')
            print(json.dumps({'success': success, 'message': out or str(e)}))
        return

    if action == 'activate-god-mode':
        god = os.path.join(desktop, 'GodMode.{ED7BA470-8E54-465E-825C-99712043E01C}')
        try:
            os.makedirs(god, exist_ok=True)
            print(json.dumps({'success': True, 'message': 'God Mode folder created on Desktop.'}))
        except Exception as e:
            print(json.dumps({'success': False, 'error': str(e)}))
        return

    if action == 'open-registry-editor':
        success, out = run('regedit')
        print(json.dumps({'success': success, 'message': out}))
        return

    if action == 'open-notepad':
        success, out = run('start notepad')
        print(json.dumps({'success': success, 'message': out}))
        return

    if action == 'open-explorer':
        success, out = run('start explorer')
        print(json.dumps({'success': success, 'message': out}))
        return

    if action == 'open-chrome':
        success, out = run('start chrome')
        print(json.dumps({'success': success, 'message': out}))
        return

    if action == 'open-cmd':
        success, out = run('start cmd')
        print(json.dumps({'success': success, 'message': out}))
        return

    if action == 'open-cmd-admin':
        success, out = run('powershell Start-Process cmd -Verb RunAs')
        print(json.dumps({'success': success, 'message': out}))
        return

    if action == 'open-powershell-admin':
        success, out = run('powershell Start-Process powershell -Verb RunAs')
        print(json.dumps({'success': success, 'message': out}))
        return

    if action == 'open-system-information':
        success, out = run('msinfo32')
        print(json.dumps({'success': success, 'message': out}))
        return

    if action == 'optimize-system':
        cmds = [
            'del /q /f /s %temp%\\*',
            'del /q /f /s C:\\Windows\\Temp\\*',
            'ipconfig /flushdns',
            'powershell.exe -NoProfile -Command "Clear-RecycleBin -Force"',
            'powershell -Command "[System.GC]::Collect()"'
        ]
        results = []
        overall = True
        for c in cmds:
            ok, out = run(c)
            results.append({'cmd': c, 'ok': ok, 'out': out})
            if not ok:
                overall = False
        print(json.dumps({'success': overall, 'results': results}))
        return

    if action == 'read-clipboard':
        ok, out = run('powershell -NoProfile -Command "Get-Clipboard -TextFormatType Text"')
        print(json.dumps({'success': ok, 'text': out}))
        return

    if action == 'clear-clipboard':
        ok, out = run('powershell -NoProfile -Command "Set-Clipboard -Value \"\""')
        print(json.dumps({'success': ok, 'message': out}))
        return

    # Generic fallback: try running the action name as a command
    ok, out = run(action)
    print(json.dumps({'success': ok, 'message': out}))


if __name__ == '__main__':
    main()
