/** ==========================================================================
 Module : Json Mapper (SQL Query for XML File)

 Author  : Eric (ChoulJoo Moon)
 Date    : 2016.06.03
 File    : yinibatis.js
 History : 2016.06.03 Initialize.
 ========================================================================== */
var sqlMapperList = {};   /* Mapper File List */

/** =======================================================================
 Module Load
 ======================================================================= */
var fs = require('fs');
var xmlModule = require('xml2js');

var xmlParser = new xmlModule.Parser({ explicitRoot  : false,   /* XML Root 삭제 */
    explicitArray : false,   /* Json 변환 후 [] 삭제 */
    tagNameProcessors: [function(name) { return name.toLowerCase(); }] /* XML 소문자 변환 */
});

/** =====================================================================
 * 지정된 경로에서 Mapper XML File 목록 및 ID를 구한다.
 * @param filepath : Mapper XML File Path
 * @param callback : callback ({err: , message: }
 ===================================================================== */
exports.ScanMapperFile = function(filepath, callback) {

    try {
        fs.readdir(filepath, 'utf-8', function (err, filelist) {
            if (err === null) {
                for (var i = 0; i < filelist.length; i++) {
                    getMapperId(filepath + '/' + filelist[i]);
                }
            }

            if (callback !== undefined) callback(err);
        });
    } catch(e) {
        throw new Error(e);
    }
};

/** =====================================================================
 * Mapper XML 파일에서 SQL ID 리스트 목록을 리턴한다.
 * @param filename : Mapper XML File
 ===================================================================== */
var getMapperId = function(filename) {

    try {
        var xml = fs.readFileSync(filename, 'utf-8');

        xmlParser.parseString(xml,
            function (err, out) {
                if (err) {
                    console.log('Configuration file open error!!');
                }
                else {
                    if (out.sql.length == undefined) {  /* XML내에 SQL ID가 1개 일때 */
                        var sql = out.sql;
                        sqlMapperList[sql.$.id] = {'filename': filename, 'idx': 0};

                    } else {
                        for (var i in out.sql) {
                            var sql = out.sql[i].$;
                            sqlMapperList[sql.id] = {'filename': filename, 'idx': i};
                        }
                    }
                }
            });
    } catch(e) {
        throw new Error(e);
    }
};

/** =====================================================================
 * Mapper Id로 지정된 SQL을 Loader 한다
 * @param mapperId : SQL Mapper Id
 * @param inParam : JSon Data
 ===================================================================== */
exports.mapperSql = function (mapperId, inParam, callback) {

        fs.readFile(sqlMapperList[mapperId].filename, 'utf-8' , function (err, xml) {
            var idx = sqlMapperList[mapperId].idx;
            xmlParser.parseString(xml, function(err, out) {
                if(err) {
                    if(callback !== undefined) callback(err, null);
                    return;
                }

                if (out.sql.length == undefined) {  /* XML내에 SQL ID가 1개 일때 */
                    out.sql._ = out.sql._.trim();

                    if(out.sql.if !== undefined) {
                        for (var i = 0; i < out.sql.if.length; i++) {
                            if (eval(out.sql.$.parameterName + '.'
                                    + out.sql.if[i].$.test))
                                out.sql._ += '\n' + out.sql.if[i]._.trim();
                        }
                    }

                    if(inParam === undefined) {
                        if(callback !== undefined) callback (null, out.sql._.trim());
                        return;
                    }
                    else {
                        if(callback !== undefined) callback(null, ChangeFieldsValue(out.sql._, inParam).trim());
                        return;
                    }
                }

                out.sql[idx]._ = out.sql[idx]._.trim();
                if(out.sql[idx].if !== undefined) {
                    for (var i = 0; i < out.sql[idx].if.length; i++) {
                        if (eval(out.sql[idx].$.parameterName + '.'
                                + out.sql[idx].if[i].$.test))
                            out.sql[idx]._ += '\n' + out.sql[idx].if[i]._.trim();
                    }
                }

                if(inParam === undefined) {
                    if(callback !== undefined) callback(null, out.sql[idx]._);
                    return;
                }
                else {
                    if(callback !== undefined) callback(null, ChangeFieldsValue(out.sql[idx]._, inParam).trim());
                    return;
                }
            })
        });
};

/** =====================================================================
 * sql 문장에서 inParam에 해당 되는 문자열 치환
 * @param sql : Sql
 * @param inParam : Json Data
 * @returns {*}
 * @constructor
 ===================================================================== */
var ChangeFieldsValue = function(sql, inParam) {
    for(var i in inParam) {
        if(inParam.hasOwnProperty(i)) {
            sql = sql.replace(eval('/#'+i+'#/gi'), inParam[i]);
        }
    }

    return (sql);
}
