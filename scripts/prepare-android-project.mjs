import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const generatedBuild = resolve(import.meta.dirname, '..', 'android/capacitor-cordova-android-plugins/build.gradle');
let source = readFileSync(generatedBuild, 'utf8');
source = source
  .replace("com.android.tools.build:gradle:8.7.2", "com.android.tools.build:gradle:8.7.3")
  .replace('lintOptions {\n        abortOnError false\n    }', "lintOptions {\n        abortOnError false\n        // Capacitor 7 supports AGP 8; AGP 9 requires a separate framework migration.\n        disable 'AndroidGradlePluginVersion'\n    }")
  .replace(/\n\s*flatDir\{\n\s*dirs 'src\/main\/libs', 'libs'\n\s*\}\n/, '\n')
  .replace(/\n\s*implementation fileTree\(dir: 'src\/main\/libs', include: \['\*\.jar'\]\)/, '');
writeFileSync(generatedBuild, source);
console.log('Prepared generated Android project without obsolete dependency warnings.');
