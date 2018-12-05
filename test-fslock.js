/**
 * Copyright (C) 2018 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var fs = require('fs');
var fslock = require('./');

module.exports = {
    tearDown: function(done) {
        try { fs.unlinkSync('./testLock') } catch (err) { }
        try { fs.unlinkSync('./lock.pid') } catch (err) { }
        done();
    },

    setLock: {
        'should set a lock': function(t) {
            try { fs.unlinkSync('./testLock') } catch (err) { }
            fslock.setLock('./testLock', process.pid);
            t.ok(fs.existsSync('./testLock'));
            t.done();
        },

        'should throw if lock is already owned': function(t) {
            fs.writeFileSync('./testLock', '1');
            t.throws(function(){ fslock.setLock('./testLock', process.pid) });
            t.done();
        },

        'should throw on error': function(t) {
            t.throws(function(){ fslock.setLock('/nonesuch/testLock', process.pid) });
            t.done();
        },

        'should automatically clear an abandoned lock': function(t) {
            fs.writeFileSync('./testLock', '999999999');
            fslock.setLock('./testLock', process.pid);
            t.equal(+fs.readFileSync('./testLock'), process.pid);
            t.done();
        },
    },

    clearLock: {
        'should clear a lock': function(t) {
            fs.writeFileSync('./testLock', process.pid);
            fslock.clearLock('./testLock', process.pid);
            t.assert(!fs.existsSync('./testLock'));
            t.done();
        },

        'clearLock should not break a held mutex': function(t) {
            fs.writeFileSync('./lock.pid', process.pid);
            t.throws(function(){ fslock.clearLock('./lock.pid', process.pid + 1) }, /not our lock/);
            fs.writeFileSync('./lock.pid', '1');
            t.throws(function(){ fslock.clearLock('./lock.pid', '2') }, /not our lock/);
            t.done();
        },

        'clearLock should break abandoned lock': function(t) {
            fs.writeFileSync('./lock.pid', '999999999');
            fslock.clearLock('./lock.pid', '1');
            t.throws(function(){ fs.readFileSync('./lock.pid') }, /ENOENT/);
            t.done();
        },

        'clearLock should ignore an already cleared mutex': function(t) {
            fslock.clearLock('./lock.pid', process.pid);
            t.done();
        },

        'clearLock should tolerate a forcibly broken lockfile': function(t) {
            var spy = t.spy(process.stdout, 'write');
            // create a mutex
            fslock.setLock('./lock.pid', process.pid);

            // forcibly break lock by removing the lockfile
            fs.unlinkSync('./lock.pid');

            // clearLock should not throw
            fslock.clearLock('./lock.pid', process.pid);

            t.done();
        }
    },

    'processNotExists': {
        'existing process owned by us should exist': function(t) {
            t.ok(!fslock.processNotExists(process.pid));
            t.done();
        },

        'existing process not owned by us should exist': function(t) {
            t.ok(!fslock.processNotExists(1));
            t.done();
        },

        'non-existing process should not exist': function(t) {
            t.ok(fslock.processNotExists(9999999));
            t.done();
        },

        'invalid pids should not exist': function(t) {
            t.ok(fslock.processNotExists('not a pid'));
            t.ok(fslock.processNotExists({}));
            t.ok(fslock.processNotExists(function(){}));
            t.done();
        },
    },
}
