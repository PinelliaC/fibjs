var test = require("test");
test.setup();

const arr = new Proxy(['one', 'two', 'three'], {
    get: function(target, name) {
        throw 'I am exception';
    }
});

const arrlength = new Proxy(['one', 'two', 'three'], {
    get: function(target, name) {
        if (name == "length") {
            return target[name];
        }
        throw 'I am exception';
    }
});

const obj = {
    get abc() {
        throw 'I am exception'
    }
};

const obj1 = new Proxy({}, {
    get: function(target, name) {
        if (name == "length") {
            return 10;
        }
        throw 'I am exception';
    }
});

describe('getter throw', () => {

    function checkthrow(cases) {
        cases.forEach((fn) => {
            assert.throws(function() {
                fn();
            });

            try {
                fn();
            } catch (e) {
                assert.equal(e, "I am exception");
            }
        })
    }

    assert.checkthrow = (fn) => {
        assert.throws(function() {
            fn();
        });

        try {
            fn();
        } catch (e) {
            assert.equal(e, "I am exception");
        }
    }

    it('assert', () => {
        assert.checkthrow(function() {
            assert.deepEqual(obj, obj);
        });

        assert.checkthrow(function() {
            assert.deepEqual([obj], [obj]);
        });

        assert.checkthrow(function() {
            assert.deepEqual([obj.abc], [obj.abc]);
        });

        // assert.checkthrow(function () {
        //     assert.deepProperty({
        //         a: obj
        //     }, "a.abc.efg");
        // });

        assert.checkthrow(function() {
            assert.propertyVal(obj, "abc", 'ball');
        });

        // assert.checkthrow(function () {
        //     assert.deepPropertyVal({
        //         a: obj
        //     }, "a.abc", 'ball');
        // });
    });

    it('json format', () => {
        assert.property(obj, 'abc');
        assert.throws(function() {
            assert.propertyVal(obj, 'region', 'hangzhou');
        });
    });


    it('util', () => {
        let util = require('util');
        //keys
        assert.deepEqual(util.keys(obj), ["abc"]);

        let cases = [
            () => {
                util.values(obj)
            },
            () => {
                util.deepFreeze(obj)
            },
            () => {
                util.extend(obj, obj)
            },
            () => {
                util.pick(obj, "abc")
            },
            () => {
                util.pick(obj, ["abc"])
            },
            () => {
                util.omit(obj, ["x"])
            },
            () => {
                util.omit(obj, arr)
            },
            () => {
                util.each(obj, (num, i) => { })
            },
            () => {
                util.each(arr, (num, i) => { })
            },
            () => {
                util.each(arrlength, (num, i) => { })
            },
            () => {
                util.map(obj, () => { })
            },
            () => {
                util.map(arr, () => { })
            },
            () => {
                util.map(arrlength, () => { })
            },
            () => {
                util.reduce(obj, () => { }, 0);
            },
            () => {
                util.reduce(arr, () => { }, 0);
            },
            () => {
                util.reduce(arrlength, () => { }, 0);
            },
        ]
        checkthrow(cases);
    })
});

require.main === module && test.run(console.DEBUG);