## About
`dcltr` is a directory organizer. It will move files to folders named by their respective extensions.
It was created particularly to organize the Downloads folder.

## Installation
* Downlod the project and in root repo perform the following:
```
npm install -g
```

## Usage
```
dcltr -h
```
shows the help menu
```
dcltr org
```
Will display the info for which files would be moved to which folder. Additional prompts would follow to accept or to deny the changes.
After accepting the change, files will be moved and you can check the directory, if not satisfied you can undo the changes. Undo prompt will be displayed after files are moved.

```
dcltr org -d <path-to-directory>
```
With option `-d` you can provide the path to directory where to run the `dcltr`