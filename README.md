qfslock
=======
[![Build Status](https://api.travis-ci.org/andrasq/node-fslock.svg?branch=master)](https://travis-ci.org/andrasq/node-fslock?branch=master)
[![Coverage Status](https://codecov.io/github/andrasq/node-fslock/coverage.svg?branch=master)](https://codecov.io/github/andrasq/node-fslock?branch=master)


Set filesystem advisory locks containing the process-id of the owning process.
No dependencies.

    fslock = require('qfslock');

    fslock.setLock('/var/lock/my.lock', process.pid);
    // fs.existsSync('/var/lock/my.lock') => true
    
    fslock.clearLock('/var/lock/my.lock', process.pid);
    // fs.existsSync('/var/lock/my.lock') => false


Api
---

### fslock.FsLock( )

Implementation class.  The package functions are calls to an internal singleton.

### fslock.setLock( locfile, pid )

Atomically create the file `lockfile` with contents `pid`.  It is an error if a
lockfile already exists containing a pid other then the `pid` setLock was called with.

### fslock.clearLock( lockfile, pid )

Remove the file `lockfile` if it contains `pid` or if it belongs to a process that
does not exist any more.  Note that a process that is not ours will appears to not
exist, but its lockfile will not have the right permissions to be removed by us.

### fslock.processNotExists( pid )

Helper function that tests whether a process has already exited, or is still
running.  Returns `true` if process id `pid` does not exist, and false otherwise.
Non-numeric process-ids do not exist.


Change Log
----------

- 0.9.0 - split out from qworker and refactored into a class
