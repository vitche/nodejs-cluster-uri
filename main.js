var q = require('q');
var request = require('request');
module.exports.Cluster = function (resources) {
    var self = this;
    // ������ ��������� �������� ��� ����������� ������ �����
    self._resources = [];
    if (undefined != resources) {
        self._resources = resources;
    }
    // ���������� ������� �� ����������� ������ �����
    self.add = function (value) {
        self._resources.push(value);
    };
    // �������� ����������� �������� �� ����������� ������ �����
    self.validate = function (callback) {
        // ������ ������ �� �������� ����������� �������
        var validationPromises = [];
        // ���������� ������ ��������
        for (var i = 0; i < self._resources.length; i++) {
            var resource = self._resources[i];
            var validationPromise = q.Promise(function (resolve, reject) {
                request
                    .get(resource)
                    .on('response', function (response) {
                        if (200 == response.statusCode) {
                            resolve(response.statusCode);
                        } else {
                            reject(new Error(response.statusCode));
                        }
                    })
                    .on('error', function (error) {
                        reject(error);
                    });
            });
            validationPromises.push(validationPromise);
        }
        // ���������� ������ �������� ����������� ��������
        q.allSettled(validationPromises).then(function (results) {
            var good = [];
            var bad = [];
            // ������������ ����������� ��������
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                var resource = self._resources[i];
                if ("fulfilled" === result.state) {
                    // ������ ��������
                    good.push(resource);
                } else {
                    // ������ ����������
                    bad.push(resource);
                }
            }
            // ������� ����������� ��������
            callback(undefined, {
                good: good,
                bad: bad
            });
        }).catch(function (error) {
            callback(error);
        });
    };
    // ��������� ������� � ���������� ������ ��������� ������
    self.firstGood = function (callback) {
        self.validate(function (error, results) {
            // ��������� ������, ���� ������ ���������� ����������
            if (undefined != error || undefined == results) {
                callback(error);
                return;
            }
            // ��� ��������� ��������
            if (0 == results.good.length) {
                callback(new Error('No good resources'));
                return;
            }
            // ������� ������ ��������� ������
            var firstGood = results.good[0];
            callback(undefined, firstGood);
        });
    };
};