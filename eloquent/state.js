import _ from 'lodash'
import Collection from './collection'

class State {
  constructor (store, module, state) {
    this.store = store
    this.module = module
    this.state = state
    this.collections = {}

    let self = this
    setInterval(() => {
      self._garbageCollector()
    }, 60 * 1000)
  }

  /*
   * Return all the items hold by the state
   */
  items () {
    return this.store.state[this.module][this.state]
  }

  /*
   * Add items with a store mutation
   */
  _addItems (items) {
    this.store.commit(this.module + '/create', {state: this.state, items})
  }

  /*
   * Remove items with a store mutation
   */
  _removeItems (items) {
    this.store.commit(this.module + '/delete', {state: this.state, items})
  }

  /*
   * Update items with a store mutation
   */
  _updateItems (items) {
    this.store.commit(this.module + '/update', {state: this.state, items})
  }

  _addCollection(name, collection) {
    this.collections[name] = collection
  }

  /*
   * The garbage collector is ran regulary for checking if there is items not required
   * by any collection in this state. For each of these items the garbage collector run
   * a delete mutation for these items.
   */
  _garbageCollector () {
    let self = this

    let items = this.items().filter(item => {
      return !self._accepted(item)
    })

    if(items.length > 0) {
      console.log('[ ELOQUENT VUEX ] Eloquent : deleted ' + items.length + ' items from ' + this.module + '/' + this.state + '.')
      this._removeItems(items)
    }
  }

  /*
   * If this item is compatible with this state (thought all created collections into it)
   */
  _accepted (item) {
    for (let i = 0; i < this.collections.length; i++) {
      if(this.collections[i]._accepted(item)) {
        return true
      }
    }

    return false
  }

  /*
   * If this item exists in the state
   */
  _exists (item) {
    return typeof(this.items().find(testItem => {
      return testItem.id === item.id
    })) !== 'undefined'
  }
}

export default State
