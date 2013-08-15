/*global define*/
define([
        '../Core/defaultValue',
        '../Core/defined',
        '../Core/defineProperties',
        '../Core/DeveloperError',
        '../Core/TimeIntervalCollection',
        '../Core/ReferenceFrame',
        './PositionProperty'
    ], function(
        defaultValue,
        defined,
        defineProperties,
        DeveloperError,
        TimeIntervalCollection,
        ReferenceFrame,
        PositionProperty) {
    "use strict";

    /**
     * A {@link Property} which is defined by a TimeIntervalCollection, where the
     * data property of the interval is another Property instance which is evaluated
     * at the provided time.
     *
     * @alias CompositePositionProperty
     * @constructor
     */
    var CompositePositionProperty = function(referenceFrame) {
        this._intervals = new TimeIntervalCollection();
        this._referenceFrame = defaultValue(referenceFrame, ReferenceFrame.FIXED);
    };

    defineProperties(CompositePositionProperty.prototype, {
        /**
         * Always returns true, since this property always varies with simulation time.
         * @memberof SampledProperty
         *
         * @type {Boolean}
         */
        isTimeVarying : {
            get : function() {
                return true;
            }
        },
        /**
         * Gets the interval collection.
         * @memberof CompositePositionProperty.prototype
         *
         * @type {TimeIntervalCollection}
         */
        intervals : {
            get : function() {
                return this._intervals;
            }
        },
        /**
         * Gets or sets the reference frame that the position is defined in.
         * @Type {ReferenceFrame}
         */
        referenceFrame : {
            get : function() {
                return this._referenceFrame;
            },
            set : function(value) {
                this._referenceFrame = value;
            }
        }
    });

    /**
     * Returns the value of the property at the specified simulation time.
     * @memberof Property
     *
     * @param {JulianDate} time The simulation time for which to retrieve the value.
     * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
     * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
     *
     * @exception {DeveloperError} time is required.
     */
    CompositePositionProperty.prototype.getValue = function(time, result) {
        return this.getValueInReferenceFrame(time, ReferenceFrame.FIXED, result);
    };

    /**
     * Returns the value of the property at the specified simulation time in the specified reference frame.
     * @memberof PositionProperty
     *
     * @param {JulianDate} time The simulation time for which to retrieve the value.
     * @param {ReferenceFrame} [referenceFrame=ReferenceFrame.FIXED] The desired referenceFrame of the result.
     * @param {Cartesian3} [result] The object to store the value into, if omitted, a new instance is created and returned.
     * @returns {Cartesian3} The modified result parameter or a new instance if the result parameter was not supplied.
     */
    CompositePositionProperty.prototype.getValueInReferenceFrame = function(time, referenceFrame, result) {
        if (!defined(time)) {
            throw new DeveloperError('time is required');
        }

        var interval = this._intervals.findIntervalContainingDate(time);
        if (defined(interval)) {
            var data = interval.data;
            if (defined(data)) {
                var value = data.getValue(time, result);
                return PositionProperty.convertToReferenceFrame(time, value, data.referenceFrame, referenceFrame, value);
            }
        }
        return undefined;
    };

    return CompositePositionProperty;
});