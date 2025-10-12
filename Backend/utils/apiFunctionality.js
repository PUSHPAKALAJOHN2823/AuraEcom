class APIFunctionality {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.totalCount = 0; // Add total count property
  }

  search() {
    if (this.queryStr.keyword) {
      this.query = this.query.find({
        $or: [
          { name: { $regex: this.queryStr.keyword, $options: "i" } },
          { color: { $regex: this.queryStr.keyword, $options: "i" } },
          { category: { $regex: this.queryStr.keyword, $options: "i" } },
        ],
      });
    }
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ["keyword", "page", "limit", "notId", "sort"];
    removeFields.forEach((key) => delete queryCopy[key]);
    if (this.queryStr.notId) {
      this.query = this.query.find({ _id: { $ne: this.queryStr.notId } });
    }
    this.query = this.query.find(queryCopy);
    return this;
  }

  async getTotalCount() {
    // Clone the query before pagination and count total documents
    const countQuery = this.query.clone();
    this.totalCount = await countQuery.countDocuments();
    return this.totalCount;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || resultPerPage || 10; // Use provided limit or default
    const skip = limit * (currentPage - 1);
    this.query = this.query.limit(limit).skip(skip);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      switch (this.queryStr.sort) {
        case "price-low":
          this.query = this.query.sort({ price: 1 });
          break;
        case "price-high":
          this.query = this.query.sort({ price: -1 });
          break;
        case "ratings":
          this.query = this.query.sort({ ratings: -1 });
          break;
        default:
          this.query = this.query.sort({ createdAt: -1 });
      }
    }
    return this;
  }
}

export default APIFunctionality;