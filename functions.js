/**
 * @Author: Krishna Kumar (krishna_aim24@yahoo.com)
 */
// reset all page items before assign / update new value
// new cop app module for additional directives
"use strict";
// new cop app module (guestDetails) for base application
angular.module("guestDetails", [
    "ngSanitize",
    "ngAnimate",
    "ngRoute"
])

// global constant variables in key: value pair
.constant("PageItems", {
    "gcno": "P2_GCNO",
    "port": "P2_US_PORT",
    "voyno": "P2_VOYNO",
    "bookno": "P2_BOOKNO",
    "seqno": "P2_SEQNO",
    "sectionName": "P2_SECTION_NAME",
    "transportation": "P2_TRANSPORTATION",
    "mobile": "P2_MOBILE",
    "guestDetails": "P2_GUEST_DETAILS",
    "userPosi": "P2_USER_POSI",
    "cashAuth": "P2_CASH_AUTH",
    "minAuthAmnt": "P2_MIN_AUTH_AMOUNT",
    "maxAuthAmnt": "P2_MAX_AUTH_AMOUNT",
    "localityCOde": "P2_LOCALITY_CODE",
    "singleVoyno": "P2_SINGLE_ROW_VOYNO",
    "singleStateroom": "P2_SINGLE_ROW_STATEROOM",
    "singleAuthno": "P2_SINGLE_ROW_AUTHNO",
    "name": "P2_NAME_H",
    "city": "P2_CITY_H",
    "checkInDate": "P2_CHECKINDATE_H",
    "checkOutDate": "P2_CHECKOUT_H",
    "hotelSegment": "P2_SEGMENT_H",
    "hotelInformationCopyToAllType": "P2_DELETE_H",
    "airline": "P2_AIRLINE_F",
    "flight": "P2_FLIGHT_F",
    "departureCity": "P2_DEPARTCITY_F",
    "departureDateTime": "P2_DEPARTDATE_F",
    "arrivalCity": "P2_ARRCITY_F",
    "arrivalDateTime": "P2_ARRDTIME_F",
    "flightSegment": "P2_SEGMENT_F",
    "flightInformationCopyToAllType": "P2_DELETE_F"
})

// global constant variables in key: value pair
.constant("GlobalConst", {
    "flight": "flightInformation",
    "hotel": "hotelInformation",
    "flightInformationVisible": "flyingOut",
    "hotelInformationVisible": "hotelNeeds",
    "flightInformationShow": "displayFlightInformation",
    "hotelInformationShow": "displayHotelInformation",
    "flightInformationAddNew": "flightDisabledAddNew",
    "hotelInformationAddNew": "hotelDisabledAddNew",
    "flightInformationCopyToAll": "flightDisabledCopyToAll",
    "hotelInformationCopyToAll": "hotelDisabledCopyToAll",
    "flightInformation": {
        "airline": "",
        "flight": "",
        "arrivalCity": "",
        "arrivalDateTime": "",
        "departureCity": "",
        "departureDateTime": ""
    },
    "hotelInformation": {
        "name": "",
        "city": "",
        "checkInDate": "",
        "checkOutDate": ""
    },
    "airlineJsonToText": "Airline",
    "flightJsonToText": "Flight",
    "arrivalCityJsonToText": "Arrival City",
    "arrivalDateTimeJsonToText": "Arrival Date Time",
    "departureCityJsonToText": "Departure City",
    "departureDateTimeJsonToText": "Departure Date Time",
    "nameJsonToText": "Name",
    "cityJsonToText": "City",
    "checkInDateJsonToText": "Check In Date",
    "checkOutDateJsonToText": "Check Out Date",
    "airlineIfValid": {
        pattren: /[a-z]/gi,
        type: 'text'
    },
    "flightIfValid": {
        pattren: /[a-z]/gi,
        type: 'text'
    },
    "arrivalCityIfValid": {
        pattren: /[a-z]/gi,
        type: 'text'
    },
    "arrivalDateTimeIfValid": {
        pattren: /^\d{2}\-\d{2}\-\d{2,4}$/gi,
        type: 'ARRIVAL'
    },
    "departureCityIfValid": {
        pattren: /[a-z]/gi,
        type: 'text'
    },
    "departureDateTimeIfValid": {
        pattren: /^\d{2}\-\d{2}\-\d{2,4}$/gi,
        type: 'DEPARTURE'
    },
    "nameIfValid": {
        pattren: /[a-z]/gi,
        type: 'text'
    },
    "cityIfValid": {
        pattren: /[a-z]/gi,
        type: 'text'
    },
    "checkInDateIfValid": {
        pattren: /^\d{2}\-\d{2}\-\d{2,4}$/gi,
        type: 'CHECKIN'
    },
    "checkOutDateIfValid": {
        pattren: /^\d{2}\-\d{2}\-\d{2,4}$/gi,
        type: 'CHECKOUT'
    },
    "insertSuccessMessage": "Changes have been added",
    "updateSuccessMessage": "Changes have been updated"
})

// GDUtility object for public methods and properties
.factory("GDUtility", ["PageItems", "GlobalConst", function userFactory(items, global) {
    var _GDUitilityPvtStorage = {
            _sharedData: null,
            _guestList: null,
            _selectedIndex: null,
            _specialNeeds: null,
            _rootScope: null,
            _cacheModel: null
        },

        // private functions for internal uses
        _GDUitilityPvt = {
            // get voyage date for application level
            _voyageDate: function() {
                var currentVoyno = _GDUtility.queryString.singleVoyno;
                return new Date(+currentVoyno.substring(2, 6), +currentVoyno.substring(6, 8) - 1, +currentVoyno.substring(8, 10));
            },

            // convert string to date format (only works if string is in valid date format ==> "Thu Jan 15 2015 07:41:33")
            _getDateFormat: function(fields, time) {
                return new Date(+fields[2], +fields[0] - 1, +fields[1], time && time.length ? time[0] : null, time && time.length ? time[1] : null);
            },

            // if user input is valid date string
            _validateDate: function(dateInString) {
                var dateFormat = dateInString ? dateInString.replace(/\(|\)/g, '').split(' ') : ['03-03-1900'];
                return _GDUitilityPvt._getDateFormat(dateFormat[0].split('-'), dateFormat[1] ? dateFormat[1].split(':') : null);
            },

            // validate selected section for selected user (one at a time)
            _ifFieldIsValid: function ifvalid(category, selectedrow, selectedcol, selected, difference) {
                var result = {
                        startIndex: 0,
                        endIndex: 0,
                        fields: []
                    },
                    selectedObject = selected.data[category][selectedcol];

                // forEach loop to validate each section
                angular.forEach(selectedObject, function loop(objValue, property) {
                    // get field type for each field
                    var exprssion = _GDUtility.getValue(property + "IfValid", global),

                        // get voyage date
                        voyageDate = _GDUitilityPvt._voyageDate();

                    result.startIndex++;
                    if (!!objValue) {
                        // if any fields matching with ARRIVAL, DEPARTURE, CHECKIN or CHECKOUT
                        if (/ARRIVAL|DEPARTURE|CHECKIN|CHECKOUT/i.test(exprssion.type)) {
                            switch (exprssion.type) {
                                // if DEPARTURE field
                                case "DEPARTURE":
                                    (function DEPARTUREDATE() {
                                        // if DEPARTURE DATE is less than voyage date, an error message should be display
                                        if (_GDUitilityPvt._validateDate(objValue) < voyageDate) {
                                            result.fields.push({
                                                property: property,
                                                message: "DEPARTURE DATE of section - " + (selectedcol + 1) + " should be greater than voyage start date: " + voyageDate
                                            });
										}
                                    }).call();
                                    break;

                                    // if ARRIVAL field
                                case "ARRIVAL": break;
                                case "CHECKIN": break;
                                case "CHECKOUT": break;
                            }
                        } else {
                            // validated successfully
                            result.endIndex++;
                        }
                    } else {
                        // pust name of error field
                        result.fields.push(property);
                    }
                });

                // if difference, means returned value should be an object otherwise boolean
                // if all fields are valid then result.startIndex should be equal to result.endIndex
                // result.startIndex should be equal to no. of fields are validated successfully
                // result.fields contains filed names for all fields witch were not validated
                return difference ? {
                    total: result.startIndex,
                    valid: result.endIndex,
                    status: result.startIndex === result.endIndex,
                    fields: result.fields
                } : result.startIndex === result.endIndex;
            },

            // get common page items with updated values
            _getCommonItems: function(selected, fields) {
                // default page items for each request
                var _default = ["voyno", "bookno", "seqno"], _listedField = [];

                // angular.forEach(["voyno", "bookno", "seqno"] + fields, if available)
                angular.forEach(fields ? _default.concat(fields) : _default, function(field, index) {

                    // if property is direct child of selected object, then update the selected field with current property value
                    _GDUtility.isDefined(selected[field]) && angular.element(_GDUtility.getValue(field, items, !0)).val(selected[field]);
                    _listedField.push(_GDUtility.getValue(field, items));
                });

                return _listedField;
            },

            // get all global page items with updated values
            _collectAllPageItems: function listItems(collection, object) {
                collection = collection || [];
                return angular.forEach(object.property, function objectProperty(field, property) {
                    field && angular.element(_GDUtility.getValue(field.join ? field[0] : field, items, !0))
                        .val(field.join ? field[1] : object.collection[field]);

                    // if property is direct child of selected object, then update the selected field with current property value
                    _GDUtility.getValue(field.join ? field[0] : field, items) && collection.push(_GDUtility.getValue(field.join ? field[0] : field, items));
                }), collection;
            },

            // get all global page items with updated values
            _getPageItems: function getitems(selected, parentObj, columnSegment, isEmpty) {
                // default page items for each request
                var storage = [], defaultFields = ["voyno", "bookno", "seqno"];

                columnSegment = columnSegment || 0;
                columnSegment && defaultFields.push.apply(defaultFields, [
                    ["flightSegment", columnSegment],
                    ["hotelSegment", columnSegment]
                ]);

                // if isEmpty is true, then add some additional fields into storage collection
                isEmpty ? storage.push.apply(storage, [_GDUtility.getValue('voyno', items),
                        _GDUtility.getValue('bookno', items), _GDUtility.getValue('seqno', items)
                    ]) :

                    // if isEmpty is false or not received as parameter, then go with default functionality
                    storage = _GDUitilityPvt._collectAllPageItems(null, {
                        collection: parentObj || selected,
                        property: defaultFields
                    }),

                    // selected is an object contains selected section
                    angular.forEach(selected, function loopObj(field, property) {
                        angular.element(_GDUtility.getValue(property, items, !0)).val(angular.uppercase(field.toString())),

                            // if current model property is not null, storage.push(current property value)
                            _GDUtility.getValue(property, items) && storage.push(_GDUtility.getValue(property, items));
                    });

                return storage;
            },

            // check if each request has completed or wait till last request
            _getPassFailStatus: function(messages) {
                var status = {
                    status: {
                        success: 0,
                        failed: 0
                    },
                    messages: []
                };

                // return a object collection based on selected property's status
                return angular.forEach(messages, function(propValue, property) {
                    var ifSuccess = propValue.status === 'Y',
                        ifFailed = propValue.status === 'N',
                        classname = ifSuccess ? 'success' : 'error';
                    ifSuccess ? status.status.success++ : ifFailed ? status.status.failed++ : '';
                    status.messages.push({
                        message: propValue.msg,
                        status: ifSuccess,
                        classname: classname
                    });
                }), status;
            },

            // save and modify information
            // @userdata: data modified by user
            // @property: selected section
            // @parentProperty: direct parent object
            // @ROOTScope: selected controller's scope
            // @messages: error / success messages
            // @ifSuccess: get to know the status (flag, if success or failed)
            _saveModifiedInfo: function saveModifiedInfo(userdata, property, parentProperty, ROOTScope, messages, ifSuccess) {
                // to check if section is from hotel information or flight information
                // flightInformation and hotelInformation to select the right application process name
                var category = _GDUtility.isDefined(userdata.airline) && !_GDUtility.isDefined(userdata.checkInDate) ? "flightInformation" : "hotelInformation";

                // @category: flightInformation / hotelInformation to select the right application process
                // @parentProperty: direct parent object
                // @property: selected section
                _GDUtility.saveAndMidify(category, parentProperty, property, {
                    scope: ROOTScope,
                    data: _GDUtility.getSelectedData(ROOTScope, "guestList", parentProperty),

                    // call on success only, if all action has been applied
                    success: function successResult(response) {

                        // push every time if request was successful
                        messages.result.push(response);
                        ifSuccess && ifSuccess();

                        // ROOTScope.$apply to apply all the changes into angular flow
                        ROOTScope.$apply(function scopeApply() {
                            // store selected data into guestList variable
                            var guestList = _GDUtility.getSelectedData(ROOTScope, "guestList", parentProperty),

                                // to check how many sections are available in particular section
                                sectionLen = guestList[category].length;

                            // change the status of category's visibility if category has at least single data
                            guestList[_GDUtility.getValue(category + "Visible", global)] = sectionLen ? "Y" : "N";

                            // enable or disable the status of CopyToAll button if category has at least single data
                            guestList[_GDUtility.getValue(category + "CopyToAll", global)] = sectionLen ? "" : "Y";
                        });
                    }
                });
            },

            // save and modify global changes
            _modifyGlobalData: function(process, value, parentProperty, messages, ifSuccess) {
                // same as "_saveModifiedInfo" but for main row (specially for transportation and mobile changes)
                _GDUtility.asyncRequest(process,
                    // get all page items (common and additional if any)
                    // this time 'transportation' and 'mobile' are tow additional fields
                    _GDUitilityPvt._getCommonItems(_GDUitilityPvtStorage._rootScope.guestList[parentProperty], ['transportation', 'mobile']),

                    function asyncRequest(response) {
                        // push every time if request was successful
                        messages.result.push(response);
                        ifSuccess && ifSuccess(null);
                    }, !0);
            }
        },

        // _GDUtility object to hold properties and methods for public uses
        _GDUtility = {
            // @imagesLocation: absolute image path for current application
            imagesLocation: "/ccl/themes/theme_5/images/",

            // @viewsLocation: absolute views / html file path for current application
            viewsLocation: "/ccl/angular/cop/views/",

            // @viewPath: get absolute view/html path for current application
            // @viewFileName: if viewFileName available then add file in last of absolute view/html path
            // viewPath() ==> returns ==> "/ccl/angular/cop/views/"
            // viewPath('viewName.html') ==> returns ==> "/ccl/angular/cop/views/viewName.html"
            viewPath: function viewPath(viewFileName) {
                return this.viewsLocation + viewFileName;
            },

            // @imagePath: get absolute image path for current application
            // @viewFileName: if viewFileName available then add file in last of absolute image path
            // viewPath() ==> returns ==> "/ccl/themes/theme_5/images/"
            // viewPath('imageName.png') ==> returns ==> "/ccl/themes/theme_5/images/imageName.png"
            imagePath: function imagePath(imageSrc) {
                return this.viewsLocation + imageSrc ? imageSrc : "";
            },

            // @getValue: get selected constant value
            // @isValue: it is optional, if true means prepend "#" to make ke jQuery selector   
            // @container: Page Items or Global Const variables / keys   
            getValue: function getValue(property, container, isValue) {
                return property ? isValue ? "#" + container[property] : container[property] : "";
            },

            // @isDefined: to check if "object" is defined or undefined
            isDefined: function isDefined(object) {
                return typeof object !== 'undefined';
            },

            // @sayMessage: to display a message with custom window (popup)
            // @result: what content should be inside window as message
            sayMessage: function sayMessage(result) {
                apex.custom[(result.status === 'Y' ? 'success' : 'error') + 'Message'](result.msg);
            },

            // @asyncRequest: alternate of apex.custom.processAsync function
            // @advantage: returns ==> JSON object
            // @process: application process name
            // @pageItems: all page items need to be sent as request parameter
            asyncRequest: function asyncRequest(process, pageItems, callback, ifJson) {
                apex.custom.processAsync({
                    appprocess: process,
                    requestpara: pageItems || []
                }, function(data) {
                    // @data: response data from server, if successful
                    // @callback: if available then apply it and convert string format to JSON format (any extra space or line break)
                    callback && callback.call({}, apex.custom.toJson(data.replace(/(?:\r\n|\r|\n)/g, "")));
                });
            },

            // get query string from current URL
            // access methods: queryString.paramName ==> returns ==> selected value
            queryString: (function queryString() {
                var params = {};
                return angular.forEach(window.location.search.substring(1).split("&"),
                    function(obj, key) {
                        var param = obj.split("=");
                        "undefined" === typeof params[param[0]] ? params[param[0]] = param[1] : "string" === typeof params[param[0]] ? params[param[0]] = [params[param[0]], param[1]] : params[param[0]].push(param[1]);
                    }), params;
            }()),

            // get angular $rootScope anywhere in application if required
            getRootScope: function getRootScope(_rootScope) {
                return _GDUitilityPvtStorage._rootScope;
            },

            // share data between controllers, in case any difficulty
            // or apply it on $rootScope to make it global
            setSharedData: function setSharedData(_sharedData) {
                _GDUitilityPvtStorage._sharedData = _sharedData;
            },

            // store selected index (element order in DOM), whenever required
            setSelectIndex: function setSelectIndex(_selectedIndex) {
                _GDUitilityPvtStorage._selectedIndex = _selectedIndex;
            },

            // to get last stored index (element order in DOM) _GDUitilityPvtStorage._selectedIndex value
            getSelectIndex: function getSelectIndex(_selectedOptions) {
                // @_selectedOptions: if object was required as returned value
                return _selectedOptions ? {
                        status: !isNaN(_GDUitilityPvtStorage._selectedIndex),
                        value: _GDUitilityPvtStorage._selectedIndex
                    } :

                    // return selected index (type Number())
                    _GDUitilityPvtStorage._selectedIndex;
            },

            // share data between controllers, in case any difficulty
            // or apply it on $rootScope to make it global to access using $rootScope
            getSharedData: function getSharedData(_sharedData) {
                return _GDUitilityPvtStorage._sharedData;
            },

            // smiler to getSelectIndex
            getSelectedRow: function getSelectedRow(_selectedIndex) {
                return _selectedIndex ? $(_selectedIndex).closest("tr[data-index]") : $();
            },

            // smiler to getSelectIndex
            getSelectedIndex: function getSelectedIndex(_selectedIndex) {
                return _selectedIndex ? +$(_selectedIndex).closest("tr[data-index]").attr("data-index") : NaN;
            },

            getSelectedData: function getSelectedData(scope, name, property) {
                return "undefined" !== typeof property ? scope[name][property] : scope[name];
            },

            setGuestList: function setGuestList(_totalList) {
                _GDUitilityPvtStorage._guestList = _totalList;
            },

            getGuestList: function getGuestList(property) {
                return _GDUtility.isDefined(property) ? _GDUitilityPvtStorage._guestList[property] : _GDUitilityPvtStorage._guestList;
            },

            setModelSpecialNeeds: function setModelSpecialNeeds(_specialNeeds) {
                _GDUitilityPvtStorage._specialNeeds = angular.copy(_specialNeeds);
            },

            getModelSpecialNeeds: function getModelSpecialNeeds(property) {
                return _GDUitilityPvtStorage._specialNeeds;
            },

            getCachedModel: function(index) {
                return _GDUtility.isDefined(index) ? _GDUitilityPvtStorage._cacheModel[index] : _GDUitilityPvtStorage._cacheModel;
            },

            // delete guest form selected section
            deleteGuestDB: function deleteGuestDB(category, selectedRow, selectedCol, selected) {
                _GDUtility.asyncRequest(category + "Delete", _GDUitilityPvt._getPageItems(selected.data[category][selectedCol],
                        selected.data, selectedCol + 1),
                    function deleteGuest(data) {
                        selected.success && selected.success(data.join ? data[0] : {
                            status: 'N',
                            msg: 'Error :- ' + data
                        });
                    }, true);
            },

            // delete all guest form selected row
            deleteAllGuestDB: function deleteAllGuestDB(section, selected) {
                angular.element(_GDUtility.getValue("sectionName", items, !0)).val(angular.uppercase(selected.section));
                _GDUtility.asyncRequest(section, _GDUitilityPvt._getCommonItems(selected.data, ['sectionName']),
                    function deleteGuest(response) {
                        selected.success && selected.success(response.join ? response[0] : {
                            status: 'N',
                            msg: 'Error :- ' + response
                        });
                    }, true);
            },

            // save and modify selected section
            saveAndMidify: function saveAndMidify(category, selectedRow, selectedCol, selected) {
                _GDUtility.ifAllFieldsAreValid.apply(this, Array.prototype.slice.call(arguments).concat(function() {
                    _GDUtility.asyncRequest(category, _GDUitilityPvt._getPageItems(selected.data[category][selectedCol],
                            selected.data, selectedCol + 1),
                        function asyncRequest(data) {
                            selected.success && selected.success(data.join ? data[0] : {
                                status: 'N',
                                msg: 'Error :- ' + data
                            });
                        }, !0);
                }, true));
            },

            // validate all fields before any action
            ifAllFieldsAreValid: function ifAllFieldsAreValid(category, selectedrow, selectedcol, selected, action, error) {
                var _totalfields = _GDUitilityPvt._ifFieldIsValid.apply(null, Array.prototype.slice.call(arguments).concat(!0));
                _totalfields.status ? action.call({}) : error ? apex.custom.getDelay(function() {
                    var errorField = apex.custom.isObject(_totalfields.fields[0]) ? _totalfields.fields[0].property : _totalfields.fields[0];
                    apex.custom.errorMessage(
                        _GDUtility.getValue(errorField + "JsonToText", global) + " " + (apex.custom.isObject(_totalfields.fields[0]) ? _totalfields.fields[0].message : " must be filled!")
                    );
                }) : "";
            },

            // add new guest to data table
            addNewGuestDB: function addNewGuestDB(category, selectedRow, selectedCol, selected) {
                selected.data[_GDUtility.getValue(category + "CopyToAll", global)] = "Y";
                _GDUtility.ifAllFieldsAreValid.apply(this, Array.prototype.slice.call(arguments).concat(function() {
                    return void 0;
                }));
            },

            // get special need content for selected rows
            specialNeeds: function specialNeeds(category, selectedRow, selectedCol, selected, isPost) {
                // @_finalSpecialNeeds: private storage
                var _finalSpecialNeeds = [],

                    // @_getItemsForSN: private storage
                    _getItemsForSN = _GDUitilityPvt._getPageItems(selected.data, selected.data, null, !0);

                // isPost, means additional fields
                isPost && (angular.forEach(selected.scope.items, function(selected, property) {
                        'Y' === selected.status && _finalSpecialNeeds.push(selected.code);
                    }),

                    // update all fields
                    angular.element('#P2_SN_CODE').val(_finalSpecialNeeds.toString()), angular.element('#P2_SPECIAL_COMMENT').val(isPost.comment),
                    angular.element('#P2_SN_ADD').val(isPost.addSpecialComments), (
                        console.log('okay')
                    ));

                _GDUtility.asyncRequest(category, isPost ? _getItemsForSN.concat(['P2_SN_CODE', 'P2_SPECIAL_COMMENT', 'P2_SN_ADD']) : _getItemsForSN,
                    function asyncRequest(response) {
                        !isPost && _GDUtility.setModelSpecialNeeds(response);
                        !response.join ? apex.custom.errorMessage('Data is not in valid format \n ' + response) : selected.success && selected.success(response);
                    }, !0);
            },

            ifAllFieldsAreValidAll: function ifAllFieldsAreValidAll(guestList, callback) {
                var guestSegment = 0,
                    guestSectionSegment = 0,
                    columnProp, _information = [];
                for (; guestSegment < guestList.length; guestSegment++) {
                    for (; guestSectionSegment < _information.length; guestSectionSegment++) {
                        for (columnProp in _information[guestSectionSegment]) {
                            if (!_information[guestSectionSegment][columnProp]) {
                                return guestSegment = guestList[guestSegment],
                                    apex.custom.getDelay(function() {
                                        apex.custom.errorMessage(guestSegment.title + " " + guestSegment.firstName + " " + guestSegment.lastName + ':- "' + _GDUtility.getValue(columnProp + "JsonToText", global) + '", is not in valid format, column: (' + (guestSectionSegment + 1) + ")");
                                    });
                            }
                        }
                    }
                }
                return callback(_information);
            },

            insertNewGuestDB: function insertNewGuestDB(category, scope, pObject) {
                angular.forEach(pObject.data, function objtData(column, property) {
                    pObject.row !== property && (column[category] = angular.copy(_GDUtility.getSelectedData(scope, "guestList", pObject.row)[category]));
                });

                angular.forEach(pObject.data, function(parentObj, parentProp) {
                    var guestSegment = 0,
                        _selectCopyAll = category + "CopyToAllType";
                    angular.element(_GDUtility.getValue(_selectCopyAll, items, !0)).val(pObject.row === parentProp ? "C" : "D");

                    angular.forEach(parentObj[category], function propSec(column, property) {
                        _GDUtility.asyncRequest(category + "CopyToAll", _GDUitilityPvt._getPageItems(column, parentObj, ++guestSegment)
                            .concat(_GDUtility.getValue(_selectCopyAll, items)),
                            function getItem(data) {
                                parentObj[_GDUtility.getValue(category + "Visible", global)] = parentObj[category].length ? "Y" : "N";
                                (pObject.data.length - 1 === parentProp) && pObject.success && pObject.success(data.join ? data[0] : {
                                    status: 'N',
                                    msg: 'Error :- ' + data
                                });
                            }, !0);
                    });
                });
            },

            getAllGuestModel: function getAllGuestModel(ROOTScope, callback) {
                var getDetails = _GDUitilityPvt._collectAllPageItems(null, {
                    collection: _GDUtility.queryString,
                    property: ["singleVoyno", "singleStateroom", "singleAuthno"]
                });

                _GDUtility.asyncRequest("getSingleRowData", getDetails, function getSingleRowData(response) {
                    ROOTScope.$apply(function applyScope(args) {
                        var message = !response.join ? "Not A valid data, try again.<br>Redirect to search page?<br>Error: <p style='color:red;'>'" + (response.split(',').join('<br>')) + "'</p>" : "Not A valid data, try again";

                        if (response.join) {
                            ROOTScope.guestList = response[0].data;
                            ROOTScope.stateroom = response[0].global.stateroom;

                            angular.forEach(ROOTScope.guestList, function(object, property) {
                                angular.extend(object, {
                                    flightDisabledCopyToAll: object.flightInformation.length ? "" : "Y",
                                    hotelDisabledCopyToAll: object.hotelInformation.length ? "" : "Y",
                                    flightDisabledAddNew: "",
                                    hotelDisabledAddNew: ""
                                });
                            });

                            _GDUtility.setGuestList(ROOTScope.guestList);
                            _GDUitilityPvtStorage._rootScope = ROOTScope;
                            _GDUitilityPvtStorage._cacheModel = JSON.parse(JSON.stringify(ROOTScope.guestList));
                        } else {
                            apex.custom.confirm({
                                body: message,
                                okay: function(object) {
                                    apex.custom.gotoPage(1);
                                }
                            });
                        }
                    });
                }, !0);
            },

            commitToServer: function commitToServer(process, options) {
                _GDUtility.ifAllFieldsAreValidAll(options.data, function validateAll(response) {
                    var overflowCounter = 0,
                        messages = {
                            result: []
                        },
                        totalFields = 0;

                    angular.forEach(options.data || [], function forEach(value, parentProperty) {
                        var _cached = _GDUtility.getCachedModel(parentProperty);

                        if (_cached.transportation != value.transportation || _cached.mobile != value.mobile) {
                            _GDUitilityPvt._modifyGlobalData.call(null, process, value, parentProperty, messages, function() {
                                _cached.transportation = angular.copy(value.transportation);
                                _cached.mobile = angular.copy(value.mobile);
                                totalFields++;
                            });
                        }

                        angular.forEach(value.flightInformation, function flightInformationSave(objValue, property) {
                            if (apex.custom.ifDifference(objValue, _cached.flightInformation[property] ? _cached.flightInformation[property] : {})) {
                                _GDUitilityPvt._saveModifiedInfo.apply(null, Array.prototype.slice.call(arguments)
                                    .concat(parentProperty, options.scope, messages, function() {
                                        _cached.flightInformation[property] = angular.copy(objValue);
                                        totalFields++;
                                    }));
                            }
                        });

                        angular.forEach(value.hotelInformation, function hotelInformationSave(objValue, property) {
                            if (apex.custom.ifDifference(objValue, _cached.hotelInformation[property] ? _cached.hotelInformation[property] : {})) {
                                _GDUitilityPvt._saveModifiedInfo.apply(null, Array.prototype.slice.call(arguments)
                                    .concat(parentProperty, options.scope, messages, function() {
                                        _cached.hotelInformation[property] = angular.copy(objValue);
                                        totalFields++;
                                    }));
                            }
                        });
                    });

                    (function onComplete() {
                        var _onComplete = setTimeout(function() {
                            messages.result.length === totalFields ? (function(messages) {
                                clearTimeout(_onComplete);

                                messages.result.length && apex.custom.confirm({
                                    title: 'Total (' + messages.result.length + ') records has been modified',
                                    body: (function() {
                                        var successStatus = _GDUitilityPvt._getPassFailStatus(messages.result),
                                            concatMessages = '(' + successStatus.status.success + ') records updated successfully and (' + successStatus.status.failed + ') records got failed<br>';
                                        return angular.forEach(successStatus.messages, function(propValue, property) {
                                            concatMessages += '<span class="status-' + (propValue.classname) + '-message">' + propValue.message + '</span></br>';
                                        }), !messages.result.length ? "No Changes to save" : concatMessages;
                                    }()),
                                    okay: function() {}
                                });

                            })(messages) : 50 > ++overflowCounter && onComplete();
                        }, 200);
                    })();

                });
            }
        };
    return _GDUtility;
}]).factory("GuestDetails", ["GDUtility", "PageItems", "GlobalConst",
    function userFactory(GDUtility, items, global) {
        return {
            getGuestList: function approveValidateData(scope) {
                GDUtility.getAllGuestModel.apply(this, arguments);
            },

            guestValidate: function approveValidateData(args) {
                GDUtility.ifAllFieldsAreValid.apply(this, arguments);
            },

            guestAdd: function approveAddData(args) {
                GDUtility.addNewGuestDB.apply(this, arguments);
            },

            guestInsert: function approveInsertData(args) {
                GDUtility.insertNewGuestDB.apply(this, arguments);
            },

            guestDelete: function approveDeleteData(args) {
                GDUtility.deleteGuestDB.apply(this, arguments);
            },

            guestSave: function approveDeleteData(args) {
                GDUtility.saveAndMidify.apply(this, arguments);
            },

            getSpecialNeeds: function getSpecialNeeds(args) {
                GDUtility.specialNeeds.apply(this, arguments);
            },

            setSpecialNeeds: function setSpecialNeeds(args) {
                GDUtility.specialNeeds.apply(this, arguments);
            },

            deleteAllGuest: function setSpecialNeeds(args) {
                GDUtility.deleteAllGuestDB.apply(this, arguments);
            },

            commitToServer: function commitToServer(args) {
                GDUtility.commitToServer.apply(this, arguments);
            }
        };
    }
]);
