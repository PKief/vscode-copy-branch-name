<h1 align="center">
  <br>
    <img src="https://raw.githubusercontent.com/PKief/vscode-copy-branch-name/main/logo.png" alt="Extension logo" width="200">
  <br><br>
  VS Code - Copy Branch Name
  <br>
  <br>
</h1>

<h4 align="center">Copy the current Git branch name to your clipboard.</h4>

<p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=PKief.copy-branch-name"><img src="https://vsmarketplacebadges.dev/version-short/pkief.copy-branch-name.svg?style=for-the-badge&colorA=252526&colorB=43A047&label=VERSION" alt="Version"></a>&nbsp;
    <a href="https://marketplace.visualstudio.com/items?itemName=PKief.copy-branch-name"><img src="https://vsmarketplacebadges.dev/rating-short/pkief.copy-branch-name.svg?style=for-the-badge&colorA=252526&colorB=43A047&label=Rating" alt="Rating"></a>&nbsp;
    <a href="https://marketplace.visualstudio.com/items?itemName=PKief.copy-branch-name"><img src="https://vsmarketplacebadges.dev/installs-short/PKief.copy-branch-name.svg?style=for-the-badge&colorA=252526&colorB=43A047&label=Installs" alt="Installs"></a>&nbsp;
    <a href="https://marketplace.visualstudio.com/items?itemName=PKief.copy-branch-name"><img src="https://vsmarketplacebadges.dev/downloads-short/PKief.copy-branch-name.svg?style=for-the-badge&colorA=252526&colorB=43A047&label=Downloads" alt="Downloads"></a>
</p>

## How it works

### Status Bar

After installing this extension you will find a new icon in the status bar. As soon as you click on it, the current branch name will be copied to your clipboard so that you can paste it somewhere else in your workflow.

<img src="https://raw.githubusercontent.com/PKief/vscode-copy-branch-name/main/images/explanation.png" alt="Explanation">

### Command palette

In addition, it's also possible to run the copy command via VS Code command palette. The command is called `Copy current branch name`.

<img src="https://raw.githubusercontent.com/PKief/vscode-copy-branch-name/main/images/command-palette.png" alt="Command palette">

If the name of the branch was successfully copied to the clipboard, a message text appears in the status bar for a few seconds.

## Multiple Repositories Support

This extension also supports multiple repositories. It copies the branch name of the repository in which the currently opened and active file is located. This ensures that you always get the correct branch name depending on the repository of the active file.
