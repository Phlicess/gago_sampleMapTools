var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

/* 获取文件上传路径 */
router.post('/data-file-upload', function (req, res) {

    console.log(req.files[0]);  // 上传的文件信息

    var uploadFileObj = new uploadFile(req.files[0]);

    console.log("无人机:" + uploadFileObj.getFileAirLineArr() + '\n\n\n');

    console.log("地块" + uploadFileObj.getFileBoundsArr());

    //fs.readFile( req.files[0].path, function (err, data) {
    //
    //    var arr = JSON.parse(data.toString()).features[0].geometry.coordinates[0];
    //
    //    var tArr = [];
    //
    //    for(var i=0; i<arr.length; i++){
    //        tArr.push(arr[i].reverse());
    //    }
    //
    //    console.log(tArr);
    //
    //    res.end(tArr.toString());
    //});
});


//上传的文件对象 (文件对象的位置)
function uploadFile(uploadFile){
    this.path = uploadFile.path;
    this.fileFullName = uploadFile.originalname;
    this.fileName = this.fileFullName.substring(0, this.fileFullName.lastIndexOf('.')).toLowerCase();
    this.fileExtName = this.fileFullName.substring(this.fileFullName.lastIndexOf('.'), this.fileFullName.length).toLowerCase();

    this.fileAirLineArr = new Array();  //无人机航线数据
    this.fileBoundsArr = new Array();  //地块边界数据

    this.fileError = '';

    //读取文件
    fs.readFile(this.path, function (err, data) {

        //是否是可用文件
        if(this.isAvailable){
            return this.fileError;
        }

        if(this.fileExtName == 'rw'){  //如果是航线文件

            var lineArr = data.toString().split('\n');

            for(var t=0; t<lineArr.length; t++){
                var jw = [];
                jw.push(lineArr[t].split(' ')[1]);
                jw.push(lineArr[t].split(' ')[0]);

                this.fileAirLineArr.push(jw);
            }

        }else if(this.fileExtName == 'goejson') {  //如果是地块边界文件
            var arr = JSON.parse(data.toString()).features[0].geometry.coordinates[0];

            if (!arr || arr == null) {
                this.fileError = "文件内容有误! 请确认后上传!";
            }

            //将经纬度反转, 存入边界变量
            for (var i = 0; i < arr.length; i++) {
                this.fileBoundsArr.push(arr[i].reverse());
            }
        }

    });

    //获取文件是否是 rw 或者 geojson, 是就返回true
    this.isAvailable = function () {
        if(this.fileExtName == 'rw' || this.fileExtName == 'geojson'){
            return true;
        } else {
            this.fileError = '文件类型错误! 请确认是 *.rw 或者 *.geojson 类型的文件';
            return false;
        }
    };

    //获取文件名称
    this.getUploadFileName = function(){
        return this.fileName;
    };
    
    //获取文件后缀名
    this.getFileExtension = function (){
        return this.fileExtName;
    };

    //获取无人机航线数据
    this.getFileAirLineArr = function () {
        return this.fileAirLineArr;
    };

    //获取地块边界数据
    this.getFileBoundsArr = function () {
        return this.fileBoundsArr;
    }
}


module.exports = router;