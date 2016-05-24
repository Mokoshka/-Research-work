'use strict';

const fs = require('fs');
const hbs = require('hbs');

const getNames = (data) => {
    let names = [];
    data.forEach(obj => {
        obj.pair.forEach(p => {
            if (names.findIndex(name => p === name.name) < 0) {
                names.push({name: p, url: obj.urls[obj.pair.indexOf(p)]});
            }
        })
    });

    return names;
};

const getColor = (number) => {
    switch (true) {
        case number > 90: {
            return 'red'
        }
        case number > 80: {
            return 'orange'
        }
        case number > 60: {
            return 'yellow-orange'
        }
        case number > 40: {
            return 'yellow'
        }
        case number > 20: {
            return 'yellow-green'
        }
        case number >= 0: {
            return 'green'
        }
        default: {
            return 'grey'
        }
    }

};

const toMatrix = (data, names) => {
    let matrix = [];

    for (let i = 0; i < names.length; i ++) {
        matrix.push(new Array(names.length));
    }

    data.forEach(obj => {
        //let firstIndex = names.indexOf(obj.pair[0]);
        let firstIndex = names.findIndex(name => obj.pair[0] === name.name);
        let secondIndex = names.findIndex(name => obj.pair[1] === name.name);
        //let secondIndex = names.indexOf(obj.pair[1]);

        matrix[firstIndex][secondIndex] = obj.similarity;
        matrix[secondIndex][firstIndex] = obj.similarity;
        matrix[secondIndex][secondIndex] = 'X';
        matrix[firstIndex][firstIndex] = 'X';
    });

    return matrix;
};

const head = `<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
    <link href="./viewer/table.css" rel="stylesheet">
</head>\n`;

const thead = `<thead>
    <tr>
        <td></td>
        {{#each names}}
            <td><a href="{{ url }}" target="_blank">{{ name }}</a></td>
        {{/each}}
    </tr>
</thead>\n`;

const table = `<table class="result-table">
    {{> thead}}
    <tbody>
        {{#each names}}
            <tr>
                <td><a href="{{ url }}">{{ name }}</a></td>
                {{{line ../matrix @index}}}
            </tr>
        {{/each }}
    </tbody>
</table>\n`;

hbs.registerPartial('head', head);
hbs.registerPartial('table', table);
hbs.registerPartial('thead', thead);
hbs.registerHelper('line', (matrix, index) => {
    let line = '';

    matrix[index].forEach(elem => {
        line += `<td class="${getColor(elem)}">${elem}</td>\n`;
    });

    return new hbs.SafeString(line);
});

function getHtml(title, names, matrix) {
    let source = `<!DOCTYPE html>
<html>
    {{> head }}
    <body>
        {{#if names }}
            {{> table }}
        {{ else }}
            <p>CSS файлы не найдены</p>
        {{/if }}
        <script src="./viewer/table.js"></script>
    </body>
</html>`;
    let template = hbs.compile(source);
    let data = { title, matrix };
    if (names) {
        data.names = names;
        data.hasNames = true;
    }
    return template(data);
}

module.exports.createHTML = (data) => {
    let names = getNames(data.statistic);
    let matrix = toMatrix(data.statistic, names);
    let result = getHtml(data.title, names, matrix);

    fs.writeFile(`${data.title}.html`, result);
};
