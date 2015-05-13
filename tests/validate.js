var clusterUri = require('../main');
function createCluster() {
    var cluster = new clusterUri.Cluster();
    cluster.add('http://google.com');
    cluster.add('http://bing.com');
    cluster.add('http://search.com');
    cluster.add('http://search.xxx/');
    cluster.add('http://yahoo.com/');
    cluster.add('http://google.com/huy');
    cluster.add('http://search.rus');
    return cluster;
}
exports.testValidate = function (test) {
    var cluster = createCluster();
    cluster.validate(function (error, results) {
        test.equal(results.good.length, 5, 'Expected 5 good resources');
        test.equal(results.bad.length, 2, 'Expected 2 bad resources');
        test.done();
    })
};
exports.testFirstGood = function (test) {
    var cluster = createCluster();
    cluster.firstGood(function (error, firstGood) {
        if (undefined != error) {
            test.fail();
            test.done();
            return;
        }
        test.equal(firstGood, 'http://google.com', 'Invalid first good resource');
        test.done();
    });
};
exports.testCompactFirstGood = function (test) {
    var cluster = new clusterUri.Cluster(['http://google.com', 'http://bing.com', 'http://search.rus']);
    cluster.firstGood(function (error, uri) {
        if (undefined != error) {
            test.fail();
            test.done();
        }
        test.equal(uri, 'http://google.com', 'Invalid first good resource');
        test.done();
    })
};