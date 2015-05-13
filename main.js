var q = require('q');
var request = require('request');
module.exports.Cluster = function (resources) {
    var self = this;
    // Список возможных ресурсов для обеспечения работы блока
    self._resources = [];
    if (undefined != resources) {
        self._resources = resources;
    }
    // Добавление ресурса по обеспечению работы блока
    self.add = function (value) {
        self._resources.push(value);
    };
    // Проверка доступности ресурсов по обеспечению работы блока
    self.validate = function (callback) {
        // Список заявок по проверке доступности ресурса
        var validationPromises = [];
        // Заполнение списка ожиданий
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
        // Выполнение группы проверок доступности ресурсов
        q.allSettled(validationPromises).then(function (results) {
            var good = [];
            var bad = [];
            // Перечисление результатов проверки
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                var resource = self._resources[i];
                if ("fulfilled" === result.state) {
                    // Ресурс доступен
                    good.push(resource);
                } else {
                    // Ресурс недоступен
                    bad.push(resource);
                }
            }
            // Возврат результатов проверки
            callback(undefined, {
                good: good,
                bad: bad
            });
        }).catch(function (error) {
            callback(error);
        });
    };
    // Проверяет ресурсы и возвращает первый доступный ресурс
    self.firstGood = function (callback) {
        self.validate(function (error, results) {
            // Произошла ошибка, либо пустая переменная результата
            if (undefined != error || undefined == results) {
                callback(error);
                return;
            }
            // Нет доступных ресурсов
            if (0 == results.good.length) {
                callback(new Error('No good resources'));
                return;
            }
            // Вернуть первый доступный ресурс
            var firstGood = results.good[0];
            callback(undefined, firstGood);
        });
    };
};