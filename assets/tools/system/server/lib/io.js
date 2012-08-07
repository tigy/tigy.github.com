var FS = require('fs');
var Path = require('path');
var Util = require('util');

function copyFile(srcFile, destFile){
	var BUF_LENGTH,
		BUF_LENGTH = 64 * 1024,
		buff = new Buffer(BUF_LENGTH),
		fdr = FS.openSync(srcFile, 'r'),
		fdw = FS.openSync(destFile, 'w'),
		bytesRead = 1,
		pos = 0;
	while(bytesRead > 0) {
		bytesRead = FS.readSync(fdr, buff, 0, BUF_LENGTH, pos);
		FS.writeSync(fdw, buff, 0, bytesRead);
		pos += bytesRead;
	}
	FS.closeSync(fdr);
	return FS.closeSync(fdw);
}

function copyDirectory(sourceDir, newDirLocation) {

    /*  Create the directory where all our junk is moving to; read the mode of the source directory and mirror it */
    var checkDir = FS.statSync(sourceDir);
    try {
        FS.mkdirSync(newDirLocation, checkDir.mode);
    } catch (e) {
        //if the directory already exists, that's okay
        if (e.code !== 'Eexists') throw e;
    }

    var files = FS.readdirSync(sourceDir);

    for(var i = 0; i < files.length; i++) {
        var currFile = FS.lstatSync(sourceDir + "/" + files[i]);

        if(currFile.isDirectory()) {
            /*  recursion this thing right on back. */
            copyDirectory(sourceDir + "/" + files[i], newDirLocation + "/" + files[i]);
        } else if(currFile.isSymbolicLink()) {
            var symlinkFull = FS.readlinkSync(sourceDir + "/" + files[i]);
            FS.symlinkSync(symlinkFull, newDirLocation + "/" + files[i]);
        } else {
            /*  At this point, we've hit a file actually worth copying... so copy it on over. */
            copyFile(sourceDir + "/" + files[i], newDirLocation + "/" + files[i]);
        }
    }
}

function createDirectory (p, mode) {
    p = Path.resolve(p);

    try {
        FS.mkdirSync(p, mode);
    } catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                createDirectory(Path.dirname(p), mode);
                createDirectory(p, mode);
                break;

            case 'Eexists' :
                var stat;
                try {
                    stat = FS.statSync(p);
                } catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
            default :
                throw err0
                break;
        }
    }

};

var IO = {

	exists: function(path) {
		return Path.existsSync(path);
	},
	
	existsDir: function(path) {
		return Path.existsSync(Path.dirname(path));
	},
	
	ensureDir: function(path) {
		path = Path.dirname(path);
		if(!IO.exists(path))
			return createDirectory(path);
	},
	
	copyFile: function(srcFile, destFile, overwrite) {
		if(!IO.exists(srcFile) || IO.exists(destFile))
			return;
		
		if(IO.existsDir(destFile))
			copyFile(srcFile, destFile);
	},
	
	copyFileAndOverwrite: function(srcFile, destFile) {
		if(!IO.exists(srcFile))
			return;
			
		if(IO.exists(destFile)){
			FS.unlinkSync(destFile);
		} else {
			IO.ensureDir(destFile);	
		}
		
		copyFile(srcFile, destFile);
	},
	
	copyDirectory: function(src, dest) {
		if(!IO.exists(src) || IO.exists(dest))
			return;
		
		copyDirectory(src, dest);
	},
	
	createDirectory: createDirectory,
	
	readFile: function(path, encoding) {
		if(IO.exists(path)) {
			encoding = encoding || "utf-8";
			var c = FS.readFileSync(path, encoding);
			if(/^utf\-?8/.test(encoding)){
				c = c.replace(/^\uFEFF/, '');
			}
			return c;
		}
		return '';
	},
	
	writeFile: function(path, content, encoding) {
		IO.ensureDir(path);
		
		FS.writeFileSync(path, content, encoding|| "utf-8");
	},
	
	openWrite: function(path, options){
		IO.ensureDir(path);
		return FS.createWriteStream(path, options);
	},
	
	deleteFile: function(path) {
		if(IO.exists(path))
			FS.unlinkSync(path);
	}

};

module.exports = IO;
