var db = require('./../helpers/db_helpers')
var helper =  require('./../helpers/helpers')
var multiparty = require('multiparty')
var fs = require('fs');
var imageSavePath = "./public/img/"

const msg_success = "successfully";
    const msg_fail = "fail";

module.exports.controller = (app, io, socket_list ) => {

    //messages for user authentication
    const msg_invalidUser = "invalid username and password";
    const msg_already_register = "This email has been already registered";
    const msg_already_added = "This value has already been added";

    //Messages for brands
    const msg_brand_added = "Brand added successfully";
    const msg_brand_update = "Brand updated successfully";
    const msg_brand_delete = "Brand deleted successfully";

    //Messages for category
    const msg_category_added = "Category added successfully";
    const msg_category_update = "Category updated successfully";
    const msg_category_delete = "Category deleted successfully";

    //Messages for type
    const msg_type_added = "Type added successfully";
    const msg_type_update = "Type updated successfully";
    const msg_type_delete = "Type deleted successfully";

    //Messages for product
    const msg_product_added = "Product added successfully";
    const msg_product_update = "Product updated successfully";
    const msg_product_delete = "Product deleted successfully";

    //Messages for quantity
    const msg_quantity_added = "Quantity added successfully";
    const msg_quantity_update = "Quantity updated successfully";
    const msg_quantity_delete = "Quantity deleted successfully";

    //Messages for quantity
    const msg_product_image_added = "Product Image added successfully";
    const msg_product_image_delete = "Product Image deleted successfully";

    //Messages for zone
    const msg_zone_added = "Zone added successfully";
    const msg_zone_update = "Zone updated successfully";
    const msg_zone_delete = "Zone deleted successfully";
    
    //Messages for area
    const msg_area_added = "Area added successfully";
    const msg_area_update = "Area updated successfully";
    const msg_area_delete = "Area deleted successfully";

    //Messages for area
    const msg_offer_added = "Offer added successfully";
    const msg_offer_delete = "Offer deleted successfully";



    //Brand Add brand Endpoint
    app.post('/api/admin/brand_add', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["brand_name"], () => {

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                db.query("SELECT `brand_id`, `brand_name` FROM `brand_detail` WHERE `brand_name` = ? AND `status` = ?", [reqObj.brand_name, "1"],(err, result) =>{
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if(result.length > 0){
                    //already added this brand
                    res.json({"status":"1", "payload":result[0],"message":msg_already_added});
                }else{
                    db.query("INSERT INTO `brand_detail`(`brand_name`, `created_date`, `modify_date`) VALUES (?, NOW(), NOW())", [
                        reqObj.brand_name
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result){
                            res.json({
                                    "status":"1", "payload":{
                                    "brand_id":result.insertId,
                                    "brand_name": reqObj.brand_name,
                                }, "message":msg_brand_added
                            });
                        } else {
                            res.json({ "status": "0", "message": msg_fail })
                        }
                     })
                    }
                })

            }, "2" )
            
        })
    })

    //Brand Update Endpoint
    app.post('/api/admin/brand_update', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["brand_id","brand_name"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 

                    db.query("UPDATE `brand_detail` SET `brand_name`= ?, `modify_date` = NOW() WHERE `brand_id`= ? AND `status` = ?" , [
                        reqObj.brand_name, reqObj.brand_id, "1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_brand_update
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })

        }, "2")
        })
    })

    //Brand Delete Endpoint
    app.post('/api/admin/brand_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["brand_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `brand_detail` SET `status`= ?, `modify_date` = NOW() WHERE `brand_id`= ?" , [
                       "2", reqObj.brand_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_brand_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //Brand List Endpoint
    app.post('/api/admin/brand_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("SELECT `brand_id`, `brand_name` FROM `brand_detail` WHERE `status`= ?" , [
                       "1", reqObj.brand_name, reqObj.brand_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                         });
                })
        }, "2")
    })



    //Add Category Endpoint
    app.post('/api/admin/product_category_add', (req,res) =>{
            var form = new multiparty.Form();

            checkAccessToken(req.headers, res, (uObj) =>{
                form.parse(req, (err,reqObj, files) => {
                    if(err){
                        helper.ThrowHtmlError(err, res);
                        return
                    }
                     helper.Dlog("----------Parameter----------")
                     helper.Dlog(reqObj)
                     helper.Dlog("----------Files----------")
                     helper.Dlog(files)

                     helper.CheckParameterValid(res, reqObj, ["cat_name","color"], () => {
                        helper.CheckParameterValid(res, files, ["image"], () => {
                            var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                            var imageFileName = "category/" + helper.fileNameGenerate(extension);
                            var newPath = imageSavePath + imageFileName;
                            fs.rename(files.image[0].path, newPath, (err) => {
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return
                                } else {
                                    db.query("INSERT INTO `category_details`(`cat_name`, `image`, `color`, `created_date`, `modify_date`) VALUES (?,?,?, NOW(), NOW())", [
                                        reqObj.cat_name[0], imageFileName, reqObj.color[0]
                                    ], (err, result) => {
                
                                        if(err){
                                            helper.ThrowHtmlError(err, res);
                                            return;
                                        }
                
                                        if(result){
                                            res.json({
                                                    "status":"1", "payload":{
                                                    "cat_id":result.insertId,
                                                    "cat_name": reqObj.cat_name[0],
                                                    "color": reqObj.color[0],
                                                    "image":helper.ImagePath() +imageFileName,
                                                }, "message":msg_category_added
                                            });
                                        } else {
                                            res.json({ "status": "0", "message": msg_fail })
                                        }
                                     })
                                }
                            })
                        })
                     })
                })


            })
    })

    //Update Category Endpoint
    app.post('/api/admin/product_category_update', (req,res) =>{
            var form = new multiparty.Form();

            checkAccessToken(req.headers, res, (uObj) =>{
                form.parse(req, (err,reqObj, files) => {
                    if(err){
                        helper.ThrowHtmlError(err, res);
                        return
                    }
                     helper.Dlog("----------Parameter----------")
                     helper.Dlog(reqObj)
                     helper.Dlog("----------Files----------")
                     helper.Dlog(files)

                        helper.CheckParameterValid(res, reqObj, ["cat_id","cat_name","color"], () => {
                        
                            var condition ="";
                            var imageFileName = "";

                            if(files.image != undefined || files.image != null){
                                var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                                imageFileName = "category/" + helper.fileNameGenerate(extension);
                                var newPath = imageSavePath + imageFileName;

                                condition = " `image` = '" + imageFileName + "',";
                                fs.rename(files.image[0].path, newPath, (err) => {
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return
                                } else {
                                    
                                }
                            })
                            }

                            

                            db.query("UPDATE `category_details` SET `cat_name`=?," + condition +" `color`=?,`modify_date`= NOW() WHERE `cat_id` =? AND `status` = ?", [
                                reqObj.cat_name[0], reqObj.color[0], reqObj.cat_id[0], "1"
                            ], (err, result) => {
        
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return;
                                }
        
                                if(result){
                                    res.json({
                                            "status":"1", "payload":{
                                            "cat_id":parseInt(reqObj.cat_id[0]),
                                            "cat_name": reqObj.cat_name[0],
                                            "color": reqObj.color[0],
                                            "image":helper.ImagePath() +imageFileName,
                                        }, "message":msg_category_update
                                    });
                                } else {
                                    res.json({ "status": "0", "message": msg_fail })
                                }
                             })
                     })
                })


            })
    })

    //Delete Category Endpoint
    app.post('/api/admin/product_category_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["cat_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `category_details` SET `status`= ?, `modify_date` = NOW() WHERE `cat_id`= ?" , [
                       "2", reqObj.cat_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_category_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //List Category Endpoint
    app.post('/api/admin/product_category_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("SELECT `cat_id`, `cat_name`, (CASE WHEN `image` != '' THEN CONCAT('"+ helper.ImagePath() +"','',`image`) ELSE `image` END) AS `image`, `color` FROM `category_details` WHERE `status`= ?" , [
                       "1",
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                         });
                })
        }, "2")
    })



    //Add Type Endpoint
    app.post('/api/admin/product_type_add', (req,res) =>{
        var form = new multiparty.Form();

        checkAccessToken(req.headers, res, (uObj) =>{
            form.parse(req, (err,reqObj, files) => {
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return
                }
                 helper.Dlog("----------Parameter----------")
                 helper.Dlog(reqObj)
                 helper.Dlog("----------Files----------")
                 helper.Dlog(files)

                 helper.CheckParameterValid(res, reqObj, ["type_name","color"], () => {
                    helper.CheckParameterValid(res, files, ["image"], () => {
                        var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                        var imageFileName = "type/" + helper.fileNameGenerate(extension);
                        var newPath = imageSavePath + imageFileName;
                        fs.rename(files.image[0].path, newPath, (err) => {
                            if(err){
                                helper.ThrowHtmlError(err, res);
                                return
                            } else {
                                db.query("INSERT INTO `type_detail`(`type_name`, `image`, `color`, `created_date`, `modify_date`) VALUES (?,?,?, NOW(), NOW())", [
                                    reqObj.type_name[0], imageFileName, reqObj.color[0]
                                ], (err, result) => {
            
                                    if(err){
                                        helper.ThrowHtmlError(err, res);
                                        return;
                                    }
            
                                    if(result){
                                        res.json({
                                                "status":"1", "payload":{
                                                "type_id":result.insertId,
                                                "type_name": reqObj.type_name[0],
                                                "color": reqObj.color[0],
                                                "image":helper.ImagePath() +imageFileName,
                                            }, "message":msg_type_added
                                        });
                                    } else {
                                        res.json({ "status": "0", "message": msg_fail })
                                    }
                                 })
                            }
                        })
                    })
                 })
            })


        })
    })

    //Update Type Endpoint
    app.post('/api/admin/product_type_update', (req,res) =>{
            var form = new multiparty.Form();

            checkAccessToken(req.headers, res, (uObj) =>{
                form.parse(req, (err,reqObj, files) => {
                    if(err){
                        helper.ThrowHtmlError(err, res);
                        return
                    }
                    helper.Dlog("----------Parameter----------")
                    helper.Dlog(reqObj)
                    helper.Dlog("----------Files----------")
                    helper.Dlog(files)

                        helper.CheckParameterValid(res, reqObj, ["type_id","type_name","color"], () => {
                        
                            var condition ="";
                            var imageFileName = "";

                            if(files.image != undefined || files.image != null){
                                var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                                imageFileName = "type/" + helper.fileNameGenerate(extension);
                                var newPath = imageSavePath + imageFileName;

                                condition = " `image` = '" + imageFileName + "',";
                                fs.rename(files.image[0].path, newPath, (err) => {
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return
                                } else {
                                    
                                }
                            })
                            }

                            

                            db.query("UPDATE `type_detail` SET `type_name`=?," + condition +" `color`=?,`modify_date`= NOW() WHERE `type_id` =? AND `status` = ?", [
                                reqObj.type_name[0], reqObj.color[0], reqObj.type_id[0], "1"
                            ], (err, result) => {
        
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return;
                                }
        
                                if(result){
                                    res.json({
                                            "status":"1", "payload":{
                                            "type_id":parseInt(reqObj.type_id[0]),
                                            "type_name": reqObj.type_name[0],
                                            "color": reqObj.color[0],
                                            "image":helper.ImagePath() +imageFileName,
                                        }, "message":msg_type_update
                                    });
                                } else {
                                    res.json({ "status": "0", "message": msg_fail })
                                }
                            })
                    })
                })


            })
    })

    //Delete Type Endpoint
    app.post('/api/admin/product_type_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["type_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                
                    db.query("UPDATE `type_detail` SET `status`= ?, `modify_date` = NOW() WHERE `type_id`= ?" , [
                    "2", reqObj.type_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_type_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //List Type Endpoint
    app.post('/api/admin/product_type_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) =>{
                
                    db.query("SELECT `type_id`, `type_name`, (CASE WHEN `image` != '' THEN CONCAT('"+ helper.ImagePath() +"','',`image`) ELSE `image` END) AS `image`, `color` FROM `type_detail` WHERE `status`= ?" , [
                    "1",
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                        });
                })
        }, "2")
    })



    //Add Product Endpoint
    app.post('/api/admin/product_add', (req,res) =>{
        var form = new multiparty.Form();

        checkAccessToken(req.headers, res, (uObj) =>{
            form.parse(req, (err,reqObj, files) => {
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return
                }
                 helper.Dlog("----------Parameter----------")
                 helper.Dlog(reqObj)
                 helper.Dlog("----------Files----------")
                 helper.Dlog(files)

                 helper.CheckParameterValid(res, reqObj, ["name","detail","cat_id", "brand_id","type_id", "unit_name", "unit_value", "quantity", "price", "stocked_date"], () => {
                    helper.CheckParameterValid(res, files, ["image"], () => {
                        var imageNamePathArr = [];
                        var fullImageNamePathArr = [];
                        files.image.forEach( imageFile => {
                            var extension = imageFile.originalFilename.substring(imageFile.originalFilename.lastIndexOf(".") + 1);
                            var imageFileName = "product/"+helper.fileNameGenerate(extension);

                            imageNamePathArr.push(imageFileName);
                            fullImageNamePathArr.push(helper.ImagePath() + imageFileName);
                            saveImage(imageFile, imageSavePath + imageFileName );
                        });

                        helper.Dlog(imageNamePathArr);
                        helper.Dlog(fullImageNamePathArr);

                        db.query("INSERT INTO `product_detail`(`cat_id`, `brand_id`, `type_id`, `name`, `detail`, `unit_name`, `unit_value`, `quantity`, `price`,`created_date`, `modify_date`) VALUES (?,?,?,?,?,?,?,?,?, NOW(),NOW())", [reqObj.cat_id[0], reqObj.brand_id[0], reqObj.type_id[0], reqObj.name[0], reqObj.detail[0], reqObj.unit_name[0], reqObj.unit_value[0], reqObj.quantity[0], reqObj.price[0]], (err, result) => {
                            if(err){
                                helper.ThrowHtmlError(err, res);
                                return
                            }

                            if(result){

                                // [{
                                //     "name":"Shoes",
                                //     "value":"20"
                                // },{
                                //     "name":"Pants",
                                //     "value":"10"
                                // }]

                                var stockInsertData =[]

                                var stockDataArr = JSON.parse(reqObj.stocked_date[0])

                                stockDataArr.forEach( nObj =>{
                                    stockInsertData.push([result.insertId, nObj.name, nObj.value]);
                                });
                                

                                if(stockDataArr.length > 0 ){
                                    db.query("INSERT INTO `quantity_detail`(`prod_id`,`prod_name`, `quantity`) VALUES ? ", [stockInsertData],(err,nResult) => {
                                    
                                        if(err){
                                            helper.ThrowHtmlError(err, res);
                                            return
                                        }
    
                                        if(nResult){
                                            helper.Dlog("Stock Insert success");
                                        }else{
                                            helper.Dlog("Stock Insert fail");
                                        }
                                    })
                                }

                                var imageInsertArr = []
                                 
                                imageNamePathArr.forEach(imagePath => {
                                    imageInsertArr.push([result.insertId, imagePath]);
                                });

                                db.query("INSERT INTO `image_detail`(`prod_id`, `image`) VALUES ?", [imageInsertArr], (err, iResult) => {
                                    if(err){
                                        helper.ThrowHtmlError(err, res);
                                        return
                                    }

                                    if(iResult){
                                        helper.Dlog("imageInsertArr success");
                                    }else{
                                        helper.Dlog("imageInsertArr Fail");
                                    }
                                })

                                res.json({ "status": "1", "message": msg_product_added })
                                
                            }else{
                                res.json({ "status": "0", "message": msg_fail })
                            }
                        })
                                
                    })
                 })
            })

        })
    })

    //Update Product Endpoint
    app.post('/api/admin/product_update', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["prod_id","name","detail","cat_id", "brand_id","type_id", "unit_name", "unit_value", "quantity", "price"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `product_detail` SET `cat_id`= ?,`brand_id`= ?,`type_id`= ?,`name`= ?,`detail`= ?,`unit_name`= ?,`unit_value`= ?,`quantity`= ?,`price`= ?,`modify_date`= NOW() WHERE `prod_id`= ? AND `status` = ?" , [reqObj.cat_id, reqObj.brand_id, reqObj.type_id, reqObj.name, reqObj.detail, reqObj.unit_name, reqObj.unit_value, reqObj.quantity, reqObj.price, reqObj.prod_id,"1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_product_update
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })

        }, "2")
        })
    })

    //Delete Product Endpoint
    app.post('/api/admin/product_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["prod_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `product_detail` SET `status`= ?,`modify_date`= NOW() WHERE `prod_id`= ? AND `status` = ?" , ["2", reqObj.prod_id, "1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_product_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })

        }, "2")
        })
    })




    //Add Product Stocks Endpoint
    app.post('/api/admin/product_stock_add', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["prod_id","prod_name","quantity"], () => {

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("INSERT INTO `quantity_detail`(`prod_id`, `prod_name`, `quantity`, `created_date`, `modify_date`) VALUES (?,?,?, NOW(), NOW())", [
                        reqObj.prod_id,reqObj.prod_name,reqObj.quantity
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result){
                            res.json({
                                    "status":"1", "message":msg_quantity_added
                            });
                        } else {
                            res.json({ "status": "0", "message": msg_fail })
                        }
                     })
                

            }, "2" )
            
        })
    })

    //Update Product Stocks Endpoint
    app.post('/api/admin/product_stock_update', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["prod_id","quantity_id","prod_name","quantity"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `quantity_detail` SET `prod_name`=?,`quantity`=?,`modify_date`=NOW() WHERE `prod_id`= ? AND `quantity_id` = ? AND `status` = ?" , [
                        reqObj.prod_name, reqObj.quantity, reqObj.prod_id, reqObj.quantity_id ,"1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_quantity_update
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })

        }, "2")
        })
    })

    //Delete Product Stocks Endpoint
    app.post('/api/admin/product_stock_delete', (req, res) => {
            helper.Dlog(req.body);
            var reqObj =  req.body;

            helper.CheckParameterValid(res, reqObj, ["prod_id","quantity_id"], () => {
                
                checkAccessToken(req.headers, res, (uObj) =>{
                    
                        db.query("UPDATE `quantity_detail` SET `status`=?,`modify_date`=NOW() WHERE `prod_id`= ? AND `quantity_id` = ? AND `status` = ?" , [
                            "2", reqObj.prod_id, reqObj.quantity_id ,"1"
                        ], (err, result) => {

                            if(err){
                                helper.ThrowHtmlError(err, res);
                                return;
                            }

                            if(result.affectedRows > 0){
                                res.json({
                                    "status": "1", "message": msg_quantity_delete
                            });
                            
                            } else{
                                res.json({ "status": "0", "message": msg_fail })
                            }
                    })

            }, "2")
            })
    })




    //Add Product Image Endpoint
    app.post('/api/admin/product_image_add', (req,res) =>{
        var form = new multiparty.Form();

        checkAccessToken(req.headers, res, (uObj) =>{
            form.parse(req, (err,reqObj, files) => {
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return
                }
                 helper.Dlog("----------Parameter----------")
                 helper.Dlog(reqObj)
                 helper.Dlog("----------Files----------")
                 helper.Dlog(files)

                 helper.CheckParameterValid(res, reqObj, ["prod_id"], () => {
                    helper.CheckParameterValid(res, files, ["image"], () => {
                        var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                        var imageFileName = "product/" + helper.fileNameGenerate(extension);
                        var newPath = imageSavePath + imageFileName;
                        fs.rename(files.image[0].path, newPath, (err) => {
                            if(err){
                                helper.ThrowHtmlError(err, res);
                                return
                            } else {

                                db.query("INSERT INTO `image_detail`(`prod_id`, `image`, `created_date`, `modify_date`) VALUES (?,?, NOW(), NOW())", [
                                    reqObj.prod_id[0], imageFileName
                                ], (err, result) => {
            
                                    if(err){
                                        helper.ThrowHtmlError(err, res);
                                        return;
                                    }
            
                                    if(result){
                                        res.json({
                                                "status":"1", "message":msg_product_image_added
                                        });
                                    } else {
                                        res.json({ "status": "0", "message": msg_fail })
                                    }
                                 })
                            }
                        })
                    })
                 })
            })


        })
    })

    //Delete Product Image Endpoint
    app.post('/api/admin/product_image_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["prod_id","img_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                
                    db.query("UPDATE `image_detail` SET `status`= ?, `modify_date` = NOW() WHERE `prod_id`= ? AND `img_id`=? AND `status`=?" , [
                    "2", reqObj.prod_id,reqObj.img_id,"1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_product_image_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //Endpoint for product list
    app.post('/api/admin/product_list', (req,res)=>{
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) =>{
                
                    db.query("SELECT `pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`, `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`quantity`, `pd`.`price`, `pd`.`created_date`, `pd`.`modify_date`, `cd`.`cat_name`, IFNULL( `bd`.`brand_name`, '') AS `brand_name`, `td`.`type_name` FROM `product_detail` AS `pd` "+
                    "INNER JOIN `category_details` AS `cd` ON `pd`.`cat_id`=`cd`.`cat_id` "+
                    "LEFT JOIN `brand_detail` AS `bd` ON `pd`.`brand_id`=`bd`.`brand_id` "+
                    "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id`=`td`.`type_id` "+
                    "WHERE `pd`.`status`=? ORDER BY `pd`.`prod_id` DESC " , [
                    "1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                        });
                })
        }, "2")
    })

    //Endpoint for product list
    app.post('/api/admin/product_detail', (req,res)=>{
        helper.Dlog(req.body);
        var reqObj =  req.body;

        checkAccessToken(req.headers, res, (uObj) =>{

            helper.CheckParameterValid(res, reqObj, ["prod_id"], () =>{

                getProductDetail(res, reqObj.prod_id);
                    
            })
        }, "2")
    })

    //Function for product Details
    function getProductDetail(res ,prod_id){
        db.query("SELECT `pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`, `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`quantity`, `pd`.`price`, `pd`.`created_date`, `pd`.`modify_date`, `cd`.`cat_name`, IFNULL( `bd`.`brand_name`, '') AS `brand_name`, `td`.`type_name` FROM `product_detail` AS `pd` "+
                    "INNER JOIN `category_details` AS `cd` ON `pd`.`cat_id`=`cd`.`cat_id` "+
                    "LEFT JOIN `brand_detail` AS `bd` ON `pd`.`brand_id`=`bd`.`brand_id` "+
                    "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id`=`td`.`type_id` "+
                    "WHERE `pd`.`status`=? AND `pd`.`prod_id`= ? ; "+
                    
                    "SELECT `quantity_id`, `prod_id`, `prod_name`, `quantity` FROM `quantity_detail` WHERE `prod_id`=? AND `status`= ? ORDER BY `prod_name` ;" +
                    
                    "SELECT `img_id`, `prod_id`, `image` FROM `image_detail` WHERE `prod_id`=? AND `status`= ?", [

                    "1", prod_id, prod_id,"1", prod_id,"1",

                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        // result= result.replace_null()
                        // helper.Dlog(result);

                        if(result[0].length > 0){

                            result[0][0].quantity_list = result[1];
                            result[0][0].images = result[2];

                            res.json({
                                "status": "1", "payload": result[0][0]
                            });

                        }else{
                            res.json({"status":"0", "message": "invalid item"})
                        }

                        
                })
    }



    //Add Zone Endpoint
    app.post('/api/admin/zone_add', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["zone_name"], () => {

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                db.query("SELECT `zone_id`, `name` FROM `zone_details` WHERE `name` = ? AND `status` = ?", [reqObj.zone_name, "1"],(err, result) =>{
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if(result.length > 0){
                    res.json({"status":"1", "payload":result[0],"message":msg_already_added});
                }else{
                    db.query("INSERT INTO `zone_details`(`name`, `created_date`, `modify_date`) VALUES (?, NOW(), NOW())", [
                        reqObj.zone_name
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result){
                            res.json({
                                    "status":"1", "payload":{
                                    "zone_id":result.insertId,
                                    "name": reqObj.zone_name,
                                }, "message":msg_zone_added
                            });
                        } else {
                            res.json({ "status": "0", "message": msg_fail })
                        }
                     })
                    }
                })

            }, "2" )
            
        })
    })

    //Update Zone Endpoint
    app.post('/api/admin/zone_update', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["zone_id","zone_name"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 

                    db.query("UPDATE `zone_details` SET `name`= ?, `modify_date` = NOW() WHERE `zone_id`= ? AND `status` = ?" , [
                        reqObj.zone_name, reqObj.zone_id, "1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_zone_update
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })

        }, "2")
        })
    })

    //Delete Zone Endpoint
    app.post('/api/admin/zone_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["zone_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `zone_details` SET `status`= ?, `modify_date` = NOW() WHERE `zone_id`= ?" , [
                       "2", reqObj.zone_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_zone_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //List Zone Endpoint
    app.post('/api/admin/zone_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("SELECT `zone_id`, `name` FROM `zone_details` WHERE `status`= ?" , [
                       "1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                         });
                })
        }, "2")
    })


    //Add Area Endpoint
    app.post('/api/admin/area_add', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["area_name", "zone_id" ], () => {

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                db.query("SELECT `area_id`, `name` FROM `area_detail` WHERE `name` = ? AND `zone_id` = ? AND `status` = ?", [reqObj.area_name, reqObj.zone_id,"1"],(err, result) =>{
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if(result.length > 0){
                    res.json({"status":"1", "payload":result[0],"message":msg_area_added});
                }else{
                    db.query("INSERT INTO `area_detail`(`name`, `zone_id`,`created_date`, `modify_date`) VALUES (?,?, NOW(), NOW())", [
                        reqObj.area_name, reqObj.zone_id
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result){
                            res.json({
                                    "status":"1", "message":msg_area_added
                            });
                        } else {
                            res.json({ "status": "0", "message": msg_fail })
                        }
                     })
                    }
                })

            }, "2" )
            
        })
    })

    //Update Area Endpoint
    app.post('/api/admin/area_update', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["area_id", "zone_id","area_name"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 

                    db.query("UPDATE `area_detail` SET `name`= ?, `zone_id` = ?, `modify_date` = NOW() WHERE `area_id`= ? AND `status` = ? " , [
                        reqObj.area_name, reqObj.zone_id, reqObj.area_id, "1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_area_update
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })

        }, "2")
        })
    })

    //Delete Area Endpoint
    app.post('/api/admin/area_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["area_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `area_detail` SET `status`= ?, `modify_date` = NOW() WHERE `area_id`= ?" , [
                       "2", reqObj.area_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_area_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //List Area Endpoint
    app.post('/api/admin/area_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) => {
                 
                    db.query("SELECT `ad`.`area_id`, `ad`.`zone_id`,`ad`.`name`,`zd`.`name` AS `zone_name` FROM `area_detail` AS `ad` INNER JOIN `zone_details` AS `zd` ON `zd`.`zone_id`=`ad`.`zone_id` AND `zd`.`status` = '1' WHERE `ad`.`status`= ? " , [
                       "1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                         });
                })
        }, "2")
    })


    //Add Offer Endpoint
    app.post('/api/admin/offer_add', (req, res) => {
            helper.Dlog(req.body);
            var reqObj =  req.body;
    
            helper.CheckParameterValid(res, reqObj, ["area_name", "zone_id" ], () => {
    
                checkAccessToken(req.headers, res, (uObj) =>{
                     
                    db.query("SELECT `area_id`, `name` FROM `area_detail` WHERE `name` = ? AND `zone_id` = ? AND `status` = ?", [reqObj.area_name, reqObj.zone_id,"1"],(err, result) =>{
                    if(err){
                        helper.ThrowHtmlError(err, res);
                        return;
                    }
    
                    if(result.length > 0){
                        res.json({"status":"1", "payload":result[0],"message":msg_area_added});
                    }else{
                        db.query("INSERT INTO `area_detail`(`name`, `zone_id`,`created_date`, `modify_date`) VALUES (?,?, NOW(), NOW())", [
                            reqObj.area_name, reqObj.zone_id
                        ], (err, result) => {
    
                            if(err){
                                helper.ThrowHtmlError(err, res);
                                return;
                            }
    
                            if(result){
                                res.json({
                                        "status":"1", "message":msg_area_added
                                });
                            } else {
                                res.json({ "status": "0", "message": msg_fail })
                            }
                         })
                        }
                    })
    
                }, "2" )
                
            })
    })


}

function saveImage(imageFile, savePath ) {
    fs.rename(imageFile.path, savePath, (err) => {

        if (err) {
            helper.ThrowHtmlError(err);
            return;
        }
    })
}

function checkAccessToken(headerObj, res, callback, require_type=""){
    helper.Dlog(headerObj.access_token);
    helper.CheckParameterValid(res, headerObj, ["access_token"] , () => {
        db.query("SELECT `user_id`, `username`, `user_type`, `name`, `email`, `mobile`, `mobile_code`, `auth_token`, `device_token`, `status` FROM `user_detail` WHERE `auth_token` =? AND `status` = ?", [headerObj.access_token,"1"], (err, result) => {
            if(err){
                helper.ThrowHtmlError(err,res);
                return
            }  
            
            helper.Dlog(result);

            if(result.length > 0){
                if(require_type != ""){
                    if(require_type == result[0].user_type){
                        return callback(result[0]);
                    } else{
                        res.json({ "status": "0", "code":"404", "message": "Access denied! Unauthorized user access." })
                    }

                } else{
                    return callback(result[0]);
                }
            }else{
                res.json({ "status": "0", "code":"404", "message": "Access denied! Unauthorized user access." })
            }
        })
    })

}

