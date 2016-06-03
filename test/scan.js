var libPath = __dirname + /lib/;
var yinibatis = require('../lib/yinibatis');
var mapperPath = __dirname+'/mapper';


console.log('##### yiniBatis Teset 1 #######');
yinibatis.ScanMapperFile(mapperPath);
console.log('##### yiniBatis Teset 1 End #######');

console.log('##### yiniBatis Teset 2 #######');
yinibatis.ScanMapperFile(mapperPath, function (err) {
  if(err === null) console.log('Mapper file scaning ok!!');
    else console.log('Mapper file scaning fail!! [%s]', err.message);
});
console.log('##### yiniBatis Teset 2 End #######');




