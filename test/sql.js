var libPath = __dirname + /lib/;
var yinibatis = require('../lib/yinibatis');
var mapperPath = __dirname+'/mapper';


console.log('##### yiniBatis Teset #######');
yinibatis.ScanMapperFile(mapperPath, function (err) {
    if(err === null) {
        console.log('Mapper file scaning ok!!');
        yinibatis.mapperSql('test2', {userid:'Mr_kim',
                                      userName:'Eric Moon',
                                      userPasswd:'1234'} ,
                            function (err, sql) {
                                console.log('sql:'+sql);
                            })
    }
    else console.log('Mapper file scaning fail!! [%s]', err.message);
});
console.log('##### yiniBatis Teset End #######');
