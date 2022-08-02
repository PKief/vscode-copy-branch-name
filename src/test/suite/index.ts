import * as glob from 'glob';
import * as Mocha from 'mocha';
import * as path from 'path';

export const run = (): Promise<void> => {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (error, files) => {
      if (error) {
        return reject(error);
      }

      // Add files to the test suite
      files.forEach((file) => mocha.addFile(path.resolve(testsRoot, file)));

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  });
};
