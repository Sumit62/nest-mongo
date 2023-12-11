export class APIFeatures {
  query: any;
  queryString: any;
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // key =>   query.email = 'string@string.com'; // Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // req.query.sort = '-ratingsAverage,price';
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }

    return this;
  }

  paginate() {
    // ?page=1&limit=2
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  search() {
    const regex = new RegExp(this.queryString.search, 'i');
    // eslint-disable-next-line no-nested-ternary
    const name =
      'firstname' in this.query.schema.paths
        ? 'firstname'
        : 'lastname' in this.query.schema.paths
          ? 'lastname'
          : 'email';
    const keyword = this.queryString.search
      ? {
          $or: [{ $or: [{ [name]: regex }] }],
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }
}
