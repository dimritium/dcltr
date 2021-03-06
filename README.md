## About
`dcltr` is a directory organizer. It will move files to folders named by their respective extensions.
It was created particularly to organize the Downloads folder.

## Installation
Requires NodeJS 12.6+ (Tested on 12.6 and 14.12.0)

If NodeJS is installed, the following command will install the package
```
npm i -g dcltr
```

## Usage
Shows the help menu:
```
dcltr -h
```

Shows the command specific help:
```
dcltr [cmd] -h

The following displays help regarding `org` command:

dcltr org -h
```

Runs the dcltr for organizing the directory:
```
dcltr org
```
The script will run on the current working directory and will display the info for which files would be moved to which folder. Additional prompts would follow to accept or to deny the changes.

After accepting the change, files will be moved and you can check the directory, if not satisfied you can undo the changes. Undo prompt will be displayed after files are moved.

With option `-d` you can provide the path to directory where to run the `dcltr`. 
```
dcltr org -d <path-to-directory>
```

##  Notes
* If there are multiple files with same name in the destination directory then the file that is being moved will be renamed
    * For instance if destination has `first.txt` and new file being moved has same name and extension then it will be named `first_1.txt`
* All dot files in the directory would be moved to the new directory named `misc`
* Tested on NodeJS 12.6 and 14.12.0