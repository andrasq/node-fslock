/**
 * fslock -- process-level filesystem mutex using fopen("rx")
 * Copyright (C) 2018 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2018-12-04 - AR.
 */

var fs = require('fs');

var singleton = new FsLock();
module.exports = {
    FsLock: FsLock,
    setLock: function(lockfile, ownerPid) {
        return singleton.setLock(lockfile, ownerPid) },
    clearLock: function clearLock(lockfile, ownerPid) {
        return singleton.clearLock(lockfile, ownerPid) },
    processNotExists: function(pid) {
        return singleton.processNotExists(pid) },
};

/*
 * implementation class
 */
function FsLock( options ) {
    options = options || {};
}

/*
 * helper function to verify that process `pid` is not running or is not ours
 * Returns false if the process is ours and is running, or is not ours.
 *      Ex      Ours    Ret     Notes
 *      N       Y,N     T       ESRCH error
 *      Y       N       F       EPERM error
 *      Y       Y       F       no error
 */
FsLock.prototype.processNotExists = function processNotExists( pid ) {
    if (!(pid > 0)) return true;
    try { process.kill(+pid, 0); return false }         // no error: exists and ours
    catch (err) { return err.code === 'ESRCH' }         // EPERM: exists not ours, ESRCH: not exists
}

/*
 * set a job mutex in the filesystem (file containing the lock owner pid)
 * If the mutex exists but the that process is gone, override the old lock.
 */
FsLock.prototype.setLock = function setLock( lockfile, ownerPid ) {
    var fd;

    try {
        fd = fs.openSync(lockfile, 'wx');
        fs.closeSync(fd);
        fs.writeFileSync(lockfile, String(ownerPid));
        fs.chmodSync(lockfile, 0600);
    }
    catch (err) {
        if (err.code === 'EEXIST') {
            this._breakAbandonedLock(lockfile);
            this.setLock(lockfile, ownerPid);
        }
        else throw err;
    }
}


// break the lock if is abandoned, or throw if cannot break
FsLock.prototype._breakAbandonedLock = function _breakAbandonedLock( lockfile ) {
    var pid = fs.readFileSync(lockfile);
// TODO: optionally only break if lock is ours (contains our ownerPid)
    if (this.processNotExists(pid)) fs.unlinkSync(lockfile);
    else throw new Error(lockfile + ': cannot break lock, process ' + pid + ' exists');
}

/*
 * clear a job mutex.  The job must not exist or must be ours (contain our lock owner pid).
 */
FsLock.prototype.clearLock = function clearLock( lockfile, ownerPid ) {
    try {
        var pid = String(fs.readFileSync(lockfile));
// TODO: optionally only clear if lock is ours (contains our ownerPid)
        if (pid === String(ownerPid) || this.processNotExists(pid)) fs.unlinkSync(lockfile);
        else throw new Error('not our lock');
    }
    catch (err) {
        if (err.code === 'ENOENT') return;
        throw err;
    }
}
