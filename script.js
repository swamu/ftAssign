import { setter, getter, isSameOrPartOfKey } from './utils';
let State = {}
/**
* State.create() take a simple JavaScript Object as argument
* returns observable
*/
State.create = (data) => {
	let old = data, inter = data, latest = data;
	return {
		observers: [],
		base: JSON.parse(JSON.stringify(old)),
		intermediate: JSON.parse(JSON.stringify(old)),
		latest: JSON.parse(JSON.stringify(old)),
		onData: { value: null, func: null },
		onNext: { val: null, count: 0, func: null },
		isLock: false,
		/**
		* getState() returns a original data
		* returns the plain old JavaScript object
		*/
		getState: () => {
			return old;
		},
		/**
		* create()  
		* (mutates the original state)
		* based on the passed-in arguments param1 and param2
		*/
		create: function (param1, param2) {
			if (param2) return setter(this.latest, param1, param2);
			Object.assign(this.latest, param1);
			return;
		},
		/**
		* on()
		* called when any of the properties are changed
		* based on the passed-in arguments param1 and param2
		*/
		on: function (param1, param2) {
			this.onData.value = param1;
			this.onData.func = param2;
			this.onNext.value = null;
			this.onNext.func = null;
			this.onNext.count = 0;
		},
		/**
		* next() 
		* called when any of the properties are changed
		* it calls the handlers at the start of next event loop
		* based on the passed-in arguments param1 and param2
		*/
		next: function (param1, param2) {
			this.onData.value = null;
			this.onData.func = null;
			this.onNext.value = param1;
			this.onNext.func = param2;
		},
		/**
		* lock() and unlock() 
		* control the call of handler when a property is changed
		* Once lock() is called the state caches all the change 
		* When unlock() is called it applies all the changes to the state and the handler is called.
		*/
		lock: function () {
			this.isLock = true;
		},
		unlock: function () {
			this.isLock = false;
      this.onData.value !== null ? this.onData.func(this.intermediate,this.latest) : this.onData.value === null ?this.onNext.func(this.intermediate,this.latest) : null;
		},
		/**
		* unsub()
		* deregisters the on and next handlers, when the on param is not affected by prop param
		*/
		unsub :function () {
			this.onData.value = null;
			this.onData.func = null;
			this.onNext.value = null;
			this.onNext.func = null;
			this.onNext.count = 0;
		},
		/**
		* prop() 
		* acts as getter and setter. 
		* If only one argument, it will retrieve the value associated with the property
		* If two arguments, first is the property and second is the value to be set to that argument
		*/
		prop: function (param1, param2) {
			if(!param2) {
				return getter(this.latest,param1);
			}
			let myval = setter(this.latest,param1,param2), error = false;
			//console.log(isSameOrPartOfKey(param1,this.onData.value,this.latest))
			if(this.onData.value){
				if(isSameOrPartOfKey(param1,this.onData.value,this.latest)){
					if(!this.isLock){
						this.onData.func(JSON.parse(JSON.stringify(this.intermediate)),JSON.parse(JSON.stringify(myval)));
					}
				}else{
					error = true;
					this.unsub();
					console.log('the keys in props and on dont match, unsuscribed');
				}
			}
			else if(this.onNext.value){
				if(isSameOrPartOfKey(param1,this.onNext.value,this.latest)){
					if(!this.isLock){
						if(this.onNext.count === 1) {this.onNext.func(JSON.parse(JSON.stringify(this.intermediate)),JSON.parse(JSON.stringify(myval)))
             this.onNext.count === 0
            }
						else if(this.onNext.count === 0) this.onNext.count = 1;
					}
				}else{
					error = true;
					this.unsub();
					console.log('the keys in props and on dont match, unsuscribed');
				}
			}
			this.intermediate = !this.isLock && !error && this.onNext.count !== 1? JSON.parse(JSON.stringify(this.latest)):this.intermediate;
			return;
		}
	};
};
export default State ;