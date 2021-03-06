import '@polymer/polymer/polymer-legacy.js';
import 'd2l-typography/d2l-typography-shared-styles.js';
import '../behaviors/date-behavior.js';
import '../behaviors/localize-behavior.js';
import './d2l-all-assessments-list-item.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-all-assessments-list">
	<template strip-whitespace="">
		<style>
			:host {
				display: block;
				width: 65%;
				min-width: 300px;
				margin: auto;
			}

			.date-header {
				@apply --d2l-body-compact-text;
				font-weight: 300;
				font-size: 0.7rem;
			}

			@media (max-width: 767px) {
				:host {
					margin: 0 -30px;
					width: calc(100% + 60px);
				}

				.date-header {
					margin-left: 30px;
				}

				:host(:dir(rtl)) .date-header {
					margin-left: 0px;
					margin-right: 30px;
				}
			}
		</style>
			<template is="dom-repeat" items="[[_assessmentItemBuckets]]">
				<h2 class="date-header">[[_getDateString(item.1)]]</h2>
					<div role="list">
						<template is="dom-repeat" items="[[item.1]]">
							<d2l-all-assessments-list-item assessment-item="[[item]]" flags="[[flags]]">

						</d2l-all-assessments-list-item></template>
					</div>

			</template>
	</template>

</dom-module>`;

document.head.appendChild($_documentContainer.content);

Polymer({

	is: 'd2l-all-assessments-list',

	properties: {
		assessmentItems: {
			type: Array,
			value: function() {
				return [];
			}
		},
		periodStart: String,
		periodEnd: String,
		_assessmentItemBuckets: {
			type: Array,
			value: function() {
				return [];
			}
		},
		flags: {
			type: Object,
			value: function() {
				return {};
			}
		}
	},

	behaviors: [
		window.D2L.UpcomingAssessments.DateBehavior,
		window.D2L.UpcomingAssessments.LocalizeBehavior
	],

	observers: [
		'_onAssessmentItemsChanged(assessmentItems, periodStart, periodEnd)'
	],

	_onAssessmentItemsChanged: function(assessmentItems) {
		if (!this.assessmentItems || !this.periodStart || !this.periodEnd) {
			return;
		}

		var dates = new Map();
		var start = this.periodStart;
		var end = this.periodEnd;

		for (var i = 0; i < assessmentItems.length; i++) {
			var item = assessmentItems[i];

			var date = new Date(item.dueDate || item.endDate);
			if (date < start || date > end) {
				// Only show items that have their due date within the current period
				// (or end date if assessment doesn't have a due date)
				continue;
			}

			var dateString = date.toDateString();

			if (!dates.get(dateString)) {
				dates.set(dateString, []);
			}

			dates.get(dateString).push(item);
		}

		this._assessmentItemBuckets = Array.from(dates);
	},

	_getDateString: function(activity) {
		var dateString;
		var dateStringPrefix;
		var calendarDateDiff = this.getDateDiffInCalendarDays(activity[0].dueDate || activity[0].endDate);

		dateString = new Intl.DateTimeFormat(this.locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(activity[0].dueDate || activity[0].endDate));

		if (calendarDateDiff === 0) {
			dateStringPrefix = this.localize('today');
		} else if (calendarDateDiff === 1) {
			dateStringPrefix = this.localize('tomorrow');
		}

		if (dateStringPrefix) {
			return this.localize('dueDateLongImminent', 'prefix', dateStringPrefix, 'dueDate', dateString);
		}

		return dateString;
	}

});
