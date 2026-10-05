from pathlib import Path
import json, os, shutil, sys

root = Path(__file__).resolve().parent
shell = (root/'ui/index.html').read_text(encoding='utf-8')
app = (root/'dist/app.js').read_text(encoding='utf-8')
css = (root/'dist/styles.css').read_text(encoding='utf-8')
google = shell.replace('<link rel="stylesheet" href="styles.css">', '<style>'+css+'</style>')
google = google.replace('<script src="app.js"></script>', '<script>'+app+'</script>')
assert 'HUB_SNAPSHOT =' not in google
(root/'google/Index.html').write_text(google, encoding='utf-8')
if '--pages' in sys.argv:
    config = {'clientId':os.getenv('ARC_GOOGLE_CLIENT_ID',''), 'apiDeploymentId':os.getenv('ARC_API_DEPLOYMENT_ID','')}
    if not all(config.values()) and '--allow-unconfigured' not in sys.argv:
        raise SystemExit('Pages blocked: configure ARC_GOOGLE_CLIENT_ID and ARC_API_DEPLOYMENT_ID first.')
    destination = root/'site'
    destination.mkdir(exist_ok=True)
    for name in ['app.js','styles.css']:
        shutil.copyfile(root/'dist'/name, destination/name)
    shutil.copyfile(root/'pages/google-backend.js', destination/'google-backend.js')
    (destination/'config.js').write_text('window.ARC_PUBLIC_CONFIG = '+json.dumps(config)+';\n')
    shell = shell.replace('<script src="app.js"></script>', '<script src="config.js"></script><script src="google-backend.js"></script><script src="https://accounts.google.com/gsi/client" async defer></script><script src="app.js"></script>')
    (destination/'index.html').write_text(shell, encoding='utf-8')
    (destination/'.nojekyll').write_text('')
print('Built requested targets. No personal records included.')
