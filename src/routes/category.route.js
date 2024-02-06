const { Router } = require('express');
const CategoryController = require('../modules/category/category.controllers');
const router = Router();
const { verifyToken } = require('../utils/utils.accessToken');


/*
type: post
Route: Create category 
userDataValidation:  Middleware used to validate category data
*/
router.post('/',verifyToken, CategoryController.categoryCreate);

/*
type: get
Route: search Category with keyword
*/
router.get("/search/:type",verifyToken, CategoryController.searchCategoryWithKeyword);

/*
type: get
Route: Get all category 
*/
router.get('/:type',verifyToken, CategoryController.categorysGet);


/*
type: get
Route: Get category by Id
*/
router.get('/categoryById/:id', CategoryController.categorysGetById);

/*
type: put
parameter: id (categoryid)
Route: Update category 
userDataValidation:  middleware used to validate category data
*/
router.put('/:id',verifyToken, CategoryController.categoryUpdate);

/*
type: Delete
parameter: id (categoryid)
Route: Delete category 
*/
router.delete('/:id',verifyToken, CategoryController.categoryDelete);

module.exports = router;