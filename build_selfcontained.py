# -*- coding: utf-8 -*-
"""Gera versoes autocontidas das paginas (CSS/JS inline) para publicar."""
import base64
import io
import os
import re
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'deploy_html')
BASE = os.environ.get('SITE_BASE', 'https://sites.google.com/view/rastrotecnologia')
RELATIVE_LINKS = os.environ.get('RELATIVE_LINKS', '') == '1'

PAGES = [
    ('index.html', 'Rastro Sistemas e Tecnologias', '/'),
    ('servicos.html', 'Serviços | Rastro Sistemas e Tecnologias', '/servicos'),
    ('rastreamento.html', 'Rastreamento | Rastro Sistemas e Tecnologias', '/rastreamento'),
    ('precos.html', 'Preços | Rastro Sistemas e Tecnologias', '/precos'),
    ('sobre.html', 'Sobre | Rastro Sistemas e Tecnologias', '/sobre'),
    ('contato.html', 'Contato | Rastro Sistemas e Tecnologias', '/contato'),
]

def main():
    os.makedirs(OUT, exist_ok=True)
    with io.open(os.path.join(ROOT, 'css', 'style.css'), encoding='utf-8-sig') as f:
        css = f.read().lstrip('\ufeff')
    with io.open(os.path.join(ROOT, 'js', 'main.js'), encoding='utf-8-sig') as f:
        js = f.read().lstrip('\ufeff')
    with io.open(os.path.join(ROOT, 'img', 'logo-rastro-small.png'), 'rb') as f:
        logo_b64 = base64.b64encode(f.read()).decode('ascii')
    logo_uri = 'data:image/png;base64,' + logo_b64

    img_out = os.path.join(OUT, 'img')
    os.makedirs(img_out, exist_ok=True)
    for name in os.listdir(os.path.join(ROOT, 'img')):
        if name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.svg')):
            shutil.copy2(os.path.join(ROOT, 'img', name), os.path.join(img_out, name))
            print('IMG', name)

    files_src = os.path.join(ROOT, 'files')
    if os.path.isdir(files_src):
        files_out = os.path.join(OUT, 'files')
        os.makedirs(files_out, exist_ok=True)
        for name in os.listdir(files_src):
            shutil.copy2(os.path.join(files_src, name), os.path.join(files_out, name))
            print('FILE', name)

    rewrites = {}
    if not RELATIVE_LINKS:
        rewrites = {
            'href="index.html': 'href="' + BASE,
            'href="servicos.html': 'href="' + BASE + '/servicos',
            'href="rastreamento.html': 'href="' + BASE + '/rastreamento',
            'href="precos.html': 'href="' + BASE + '/precos',
            'href="sobre.html': 'href="' + BASE + '/sobre',
            'href="contato.html': 'href="' + BASE + '/contato',
        }

    for fname, title, path in PAGES:
        with io.open(os.path.join(ROOT, fname), encoding='utf-8-sig') as f:
            html = f.read()
        # remove o link de CSS e injeta o CSS inline
        html = re.sub(r'\s*<link rel="stylesheet" href="css/style\.css">', '', html)
        html = re.sub(r'<head>', lambda m: '<head>\n<style>\n' + css + '\n</style>', html, count=1)
        # injeta o JS inline
        html = re.sub(r'\s*<script src="js/main\.js"></script>', lambda m: '\n<script>\n' + js + '\n</script>', html)
        # logo -> base64
        html = html.replace('img/logo-rastro.png', logo_uri)
        # reescreve links internos
        for old, new in rewrites.items():
            html = html.replace(old, new)
        # garante title
        html = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, html, count=1, flags=re.S)
        out_path = os.path.join(OUT, path.strip('/') if path.strip('/') else 'index') + '.html'
        with io.open(out_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(html)
        print('OK', fname, '->', out_path, '(' + str(len(html)) + ' bytes)')

if __name__ == '__main__':
    main()
