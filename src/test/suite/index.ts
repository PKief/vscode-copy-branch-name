import * as path from 'path';
import { glob } from 'glob';
import * as Mocha from 'mocha';

export const run = async (): Promise<void> => {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '..');
  const files = await glob('**/**.test.js', { cwd: testsRoot });

  // Add files to the test suite
  files.forEach((file) => mocha.addFile(path.resolve(testsRoot, file)));

  try {
    // Run the mocha test
    mocha.run((failures) => {
      if (failures > 0) {
        throw new Error(`${failures} tests failed.`);
      }
    });
  } catch (error) {
    console.error(error);
  }
};
