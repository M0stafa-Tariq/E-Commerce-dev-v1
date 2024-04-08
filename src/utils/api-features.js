import { paginationFunction } from "./pagination.js";

/**
 * @class APIFeatures
 * @constructor query, mongooseQuery
 * @description this class will be used to filter, sort, paginate and search the data
 * @method pagination  
    *@description this method will be used to divide the data into chunks or patches
    *@param {page, size}
 * @method sort
    * @description this method will be used to sort the data depending on the given field
    * @check if the field is not given then it will sort the data by createdAt field in descending order
    * @param {sortBy}
 * @method search
    * @description this method will be used to search the data depending on the given fields
    * @param {search}  => object contains the fields that we want to search by 
 * @method filters
    *@description this method will be used to filter the data depending on the given fields but more dynamically than the @mtethod search
    *@param {filters} => object contains the fields that we want to filter by 
    *@example 
        * @params will be in this formate
        * appliedPrice[gte]=100 
        * stock[lte]=200
        * discount[ne]=0
        * title[regex]=iphone
        * @object will be like this after the replace method
        * { appliedPrice: { $gte: 100 }, stock: { $lte: 200 }, discount: { $ne: 0 }, title: { $regex: 'iphone' }
 */

export class APIFeatures {
  //constructor
  constructor(query, mogooseQuery) {
    this.query = query;
    this.mogooseQuery = mogooseQuery;
  }

  //pagination method
  pagination({ page, size }) {
    const { limit, skip } = paginationFunction({ page, size });
    this.mogooseQuery = this.mogooseQuery.limit(limit).skip(skip);

    return this;
  }
  //sort method
  sort(sortBy) {
    if (!sortBy) {
      this.mogooseQuery = this.mogooseQuery.sort({ createdAt: -1 });
      return this;
    }
    const formula = sortBy
      .replace(/desc/g, -1)
      .replace(/asc/g, 1)
      .replace(/ /g, ":");
    const [key, value] = formula.split(":");
    this.mogooseQuery = this.mogooseQuery.sort({ [key]: +value });
    return this;
  }

  //search method
  search(search) {
    const queryFilter = {};

    if (search.title)
      queryFilter.title = { $regex: search.title, $options: "i" };
    if (search.desc) queryFilter.desc = { $regex: search.desc, $options: "i" };
    if (search.discount) queryFilter.discount = { $ne: 0 };
    if (search.stock) queryFilter.discount = { $ne: 0 };
    if (search.priceFrom && !search.priceTo)
      queryFilter.appliedPrice = { $gte: search.priceFrom };
    if (search.priceTo && !search.priceFrom)
      queryFilter.appliedPrice = { $lte: search.priceTo };
    if (search.priceTo && search.priceFrom)
      queryFilter.appliedPrice = {
        $gte: search.priceFrom,
        $lte: search.priceTo,
      };

    this.mogooseQuery = this.mogooseQuery.find(queryFilter);
    return this;
  }

  //filter method
  filters(filters) {
    const queryFilter = JSON.stringify(filters).replace(
      /gt|gte|lt|lte|in|nin|eq|ne|regex/g,
      (operator) => `$${operator}`
    );
    this.mogooseQuery = this.mongooseQuery.find(JSON.parse(queryFilter));
    return this;
  }
}
