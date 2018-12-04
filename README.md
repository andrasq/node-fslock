fslock
======

Set filesystem advisory locks containing the process-id of the owning process.
No dependencies.

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

Helper function that tests whether our child process has already exited, or is still
running.  Returns `true` if process id `pid` does not exist or is not ours, and
`false` if that process is ours and is still running.


Change Log
----------

- 0.9.0 - split out from qworker and refactored into a class
