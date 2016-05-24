'use strict';

const rp = require('request-promise');

var key;
var mentors;
var organization;

const getRepoUrl = (repository) => {
    return `https://api.github.com/repos/${organization}/${repository}/pulls?state=all&page=1&per_page=200&access_token=`;
};

const request = (url) => {
    return rp(getOptions(url))
};

const getOptions = (uri) => {
    return {
        uri,
        qs: {
            access_token: key
        },
        headers: {
            'User-Agent': 'mdf-app'
        },
        json: true
    }
};

function getFileCSS(files) {
    var css = files.filter(file => {
        return (file.filename === 'index.css')
    });

    if (css.length !== 0) {
        return request(css[0].contents_url)
    }
}

function getDataOfPull(pull) {
    var data = {};
    return rp(getOptions(pull.url))
        .then(pullData => {
            data.name = pullData.title;
            data.author = pullData.user.login;

            return request(pullData.url + '/files')
        })
        .then(files => {
            return getFileCSS(files)
        })
        .catch(err => {
            if (err.code === 403) {

            }
        })
        .then(file => {
            if (file) {
                return request(file.download_url);
            }
        })
        .then(css => {
            if (css) {
                data.css = css;
            }

            return data;
        });
}

module.exports.getCssFiles = (repository) => {
    return request(getRepoUrl(repository))
        .then(pulls => {
            pulls = pulls
                .filter(pull => {
                    return !(mentors.find(mentor => mentor === pull.user.login))
                })
                .map(pull => {
                    return getDataOfPull(pull)
                });

            return Promise.all(pulls);
        })
        .then(result => {
            return result.filter(res => {
                return res.css !== undefined
            });
        });
};

module.exports.setSettings = (settings) => {
    key = settings.access_token;
    mentors = settings.mentors || ["gogoleff", "mokhov", "xiiivii", "bratva", "dzlk", "evilj0e", "f0rmat1k", "greyevil",
            "i4got10", "maxvipon", "mrsamo", "msmirnov", "sameoldmadness", "sinseveriya", "trixartem", "VorontsovMaxim",
            "Zhigalov"];
    organization = settings.organization || 'urfu-2015';

    if (!key) {
        throw new Error('Не указан ключ доступа для GitHub');
    }
};
