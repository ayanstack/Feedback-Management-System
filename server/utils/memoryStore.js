import bcrypt from 'bcryptjs';

// Simple 24-char ObjectId hex generator
export const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const random = 'xxxxxxxxxxxxxxxx'
    .replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16))
    .toLowerCase();
  return timestamp + random;
};

export class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.items = [];
  }

  // Synchronous method returning Thenable Query (just like Mongoose)
  find(query = {}) {
    const self = this;
    const queryObj = {
      _query: query,
      _sortField: null,
      _sortAsc: true,
      _limitCount: null,
      _populateField: null,

      sort(sortOpt) {
        if (typeof sortOpt === 'object') {
          const key = Object.keys(sortOpt)[0];
          this._sortField = key;
          this._sortAsc = sortOpt[key] >= 0;
        }
        return this;
      },

      limit(n) {
        this._limitCount = Number(n);
        return this;
      },

      populate(field) {
        this._populateField = field;
        return this;
      },

      select() {
        return this;
      },

      then(resolve, reject) {
        try {
          let results = self._matchQuery(this._query);

          if (this._sortField) {
            results.sort((a, b) => {
              let valA = a[this._sortField];
              let valB = b[this._sortField];
              if (valA instanceof Date) valA = valA.getTime();
              if (valB instanceof Date) valB = valB.getTime();
              if (valA < valB) return this._sortAsc ? -1 : 1;
              if (valA > valB) return this._sortAsc ? 1 : -1;
              return 0;
            });
          }

          if (this._limitCount !== null) {
            results = results.slice(0, this._limitCount);
          }

          const wrapped = results.map((item) => ({
            ...item,
            toObject: () => ({ ...item }),
          }));

          resolve(wrapped);
        } catch (err) {
          reject(err);
        }
      },
    };

    return queryObj;
  }

  // Synchronous method returning Thenable Query
  findOne(query = {}) {
    const self = this;
    const queryObj = {
      _query: query,
      select(fields) {
        return this;
      },
      populate(field) {
        return this;
      },
      then(resolve, reject) {
        try {
          const results = self._matchQuery(this._query);
          const item = results.length > 0 ? results[0] : null;
          if (!item) {
            return resolve(null);
          }
          const doc = {
            ...item,
            toObject: () => ({ ...item }),
            comparePassword: async function (enteredPassword) {
              return await bcrypt.compare(enteredPassword, this.password);
            },
          };
          resolve(doc);
        } catch (err) {
          reject(err);
        }
      },
    };

    return queryObj;
  }

  // Synchronous method returning Thenable Query
  findById(id) {
    const self = this;
    const idStr = id ? id.toString() : '';
    const queryObj = {
      _id: idStr,
      select() {
        return this;
      },
      populate(field) {
        return this;
      },
      then(resolve, reject) {
        try {
          const item = self.items.find((i) => i._id.toString() === this._id);
          if (!item) {
            return resolve(null);
          }
          const doc = {
            ...item,
            toObject: () => ({ ...item }),
            comparePassword: async function (enteredPassword) {
              return await bcrypt.compare(enteredPassword, this.password);
            },
            deleteOne: async () => {
              self.items = self.items.filter((i) => i._id.toString() !== this._id);
              return true;
            },
          };
          resolve(doc);
        } catch (err) {
          reject(err);
        }
      },
    };

    return queryObj;
  }

  async create(data) {
    let password = data.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    const id = data._id ? data._id.toString() : generateId();

    const newItem = {
      _id: id,
      ...data,
      password,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      toObject: function () {
        return { ...this };
      },
      comparePassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      },
      deleteOne: async () => {
        this.items = this.items.filter((i) => i._id.toString() !== id);
        return true;
      },
    };

    this.items.push(newItem);
    return newItem;
  }

  async insertMany(docs) {
    const inserted = [];
    for (const doc of docs) {
      const item = await this.create(doc);
      inserted.push(item);
    }
    return inserted;
  }

  async findByIdAndUpdate(id, updateData, options) {
    const idStr = id ? id.toString() : '';
    const index = this.items.findIndex((i) => i._id.toString() === idStr);
    if (index === -1) return null;

    this.items[index] = {
      ...this.items[index],
      ...updateData,
      updatedAt: new Date(),
    };

    return {
      ...this.items[index],
      toObject: () => ({ ...this.items[index] }),
    };
  }

  async deleteOne(query) {
    if (query && query._id) {
      const idStr = query._id.toString();
      this.items = this.items.filter((i) => i._id.toString() !== idStr);
    }
    return { acknowledged: true, deletedCount: 1 };
  }

  async deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      const count = this.items.length;
      this.items = [];
      return { acknowledged: true, deletedCount: count };
    }

    if (query.event) {
      const eventIdStr = query.event.toString();
      const before = this.items.length;
      this.items = this.items.filter(
        (i) => (i.event?._id?.toString() || i.event?.toString()) !== eventIdStr
      );
      return { acknowledged: true, deletedCount: before - this.items.length };
    }

    return { acknowledged: true, deletedCount: 0 };
  }

  async countDocuments(query = {}) {
    const matched = this._matchQuery(query);
    return matched.length;
  }

  _matchQuery(query) {
    return this.items.filter((item) => {
      for (const key of Object.keys(query)) {
        if (key === '$or' && Array.isArray(query.$or)) {
          const matchedAny = query.$or.some((condition) => {
            const condKey = Object.keys(condition)[0];
            const condVal = condition[condKey];
            const itemVal = item[condKey] ? String(item[condKey]).toLowerCase() : '';
            if (condVal?.$regex) {
              return itemVal.includes(condVal.$regex.toLowerCase());
            }
            return itemVal === String(condVal).toLowerCase();
          });
          if (!matchedAny) return false;
          continue;
        }

        const queryVal = query[key];
        const itemVal = item[key];

        if (key === 'email' && typeof queryVal === 'string') {
          if ((itemVal || '').toLowerCase() !== queryVal.toLowerCase()) return false;
          continue;
        }

        if (key === 'event') {
          const itemEventId = itemVal?._id ? itemVal._id.toString() : itemVal?.toString();
          const queryEventId = queryVal?._id ? queryVal._id.toString() : queryVal?.toString();
          if (itemEventId !== queryEventId) return false;
          continue;
        }

        if (typeof queryVal === 'object' && queryVal?.$regex) {
          const str = itemVal ? String(itemVal).toLowerCase() : '';
          if (!str.includes(queryVal.$regex.toLowerCase())) return false;
          continue;
        }

        if (itemVal !== queryVal) {
          return false;
        }
      }
      return true;
    });
  }
}
