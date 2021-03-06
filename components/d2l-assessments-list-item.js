import '@polymer/polymer/polymer-legacy.js';
import 'd2l-typography/d2l-typography-shared-styles.js';
import 'd2l-colors/d2l-colors.js';
import 'd2l-icons/d2l-icon.js';
import 'd2l-icons/tier1-icons.js';
import 'd2l-icons/tier2-icons.js';
import '../behaviors/date-behavior.js';
import '../behaviors/localize-behavior.js';
import '../behaviors/types-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-assessments-list-item">
	<template strip-whitespace="">
		<style>
			:host {
				display: flex;
				flex-direction: row;
				margin: 10px 0;
				justify-content: space-between;
				align-items: center;
				background-color: var(--d2l-color-white);
			}

			.activity-container {
				display: flex;
				width: 100%;
				align-items: center;
			}

			.assessment-title {
				@apply --d2l-heading-3;
				margin: 0;
				font-size: 16px;
				line-height: 1.2rem;
				font-weight: normal;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.assessment-info {
				@apply --d2l-body-standard-text;
				font-size: 12px;
				line-height: 1;
				display: flex;
				flex-direction: column;
			}

			.info-container {
				display: block;
				width: calc(100% - 44px);
			}

			d2l-icon.completion-icon {
				fill: var(--d2l-color-olivine);
				margin-left: 10px;
			}
			:host(:dir(rtl)) d2l-icon.completion-icon {
				margin-left: 0;
				margin-right: 10px;
			}

			d2l-icon.separator-icon {
				opacity: 0.8;
				width: 14px;
				height: 14px;
			}

			.activity-icon-container {
				width: 24px;
				margin-right: 20px;
			}

			:host(:dir(rtl)) .activity-icon-container {
				margin-right: 0px;
				margin-left: 20px;
			}

			:host(:dir(rtl)) .activity-icon[icon="d2l-tier2:assignments"] {
				width: 26px;
			}

			.activity-info {
				display: inline-flex;
				flex: 1;
				align-items: center;
				min-width: 0;
			}

			.course-name {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.date, .assessment-type {
				display: inline;
			}

			.assessment-details {
				margin-top: 0.2rem;
			}

			.has-activity-details:hover,
			.has-activity-details:focus {
				cursor: pointer;
			}

			.has-activity-details:hover .assessment-title,
			.has-activity-details:focus .assessment-title {
				color: var(--d2l-color-celestine);
				outline-width: 0;
				text-decoration: underline;
			}

			.has-activity-details:hover .activity-icon,
			.has-activity-details:focus .activity-icon {
				color: var(--d2l-color-celestine);
			}

		</style>
			<div class="activity-container">
				<div class="activity-info">
					<div class="activity-icon-container">
						<d2l-icon class="activity-icon" icon="[[_getAssessmentIcon(assessmentItem)]]"></d2l-icon>
					</div>
					<div class="info-container">
						<h3 class="assessment-title">[[assessmentItem.name]]</h3>
						<div class="assessment-info">
							<div class="course-name">[[assessmentItem.courseName]]</div>
							<div class="assessment-details">
								<div class="assessment-type">[[_getAssessmentType(assessmentItem)]]</div>
								<template is="dom-if" if="[[_hasDueDate(assessmentItem)]]">
									<d2l-icon class="separator-icon" icon="d2l-tier1:bullet"></d2l-icon>
									<div class="date">[[_getDueDateString(assessmentItem.dueDate)]]</div>
								</template>
								<template is="dom-if" if="[[_showEndDate(assessmentItem)]]">
									<d2l-icon class="separator-icon" icon="d2l-tier1:bullet"></d2l-icon>
									<div class="date">[[_getEndDateString(assessmentItem.endDate)]]</div>
								</template>
							</div>
						</div>
					</div>
				</div>
				<template is="dom-if" if="[[_isCompleted(assessmentItem)]]">
					<d2l-icon class="completion-icon" icon="d2l-tier1:check"></d2l-icon>
				</template>
			</div>
	</template>


</dom-module>`;

document.head.appendChild($_documentContainer.content);

Polymer({

	is: 'd2l-assessments-list-item',

	properties: {
		assessmentItem: Object,
		flags: {
			type: Boolean,
			value: false
		},
		_canOpenActivityDetails: {
			type: Boolean,
			computed: '_computeCanOpenActivityDetails(assessmentItem, flags)',
			observer: '_canOpenActivityDetailsUpdated'
		}
	},

	behaviors: [
		window.D2L.UpcomingAssessments.DateBehavior,
		window.D2L.UpcomingAssessments.LocalizeBehavior,
		window.D2L.UpcomingAssessments.TypesBehavior
	],

	_hasDueDate: function(item) {
		return !!item.dueDate;
	},

	_hasEndDate: function(item) {
		return !!item.endDate;
	},

	_showEndDate: function(item) {
		return !this._hasDueDate(item) && this._hasEndDate(item);
	},

	_isCompleted: function(item) {
		return item.isCompleted;
	},

	_getDueDateString: function(dueDateUTC) {
		return this._getDateString(dueDateUTC, 'dueDateShort', 'dueDate');
	},

	_getEndDateString: function(endDateUTC) {
		return this._getDateString(endDateUTC, 'endDateShort', 'endDate');
	},

	_getDateString: function(dateUTC, langTerm, key) {
		var dateString;
		var calendarDateDiff = this.getDateDiffInCalendarDays(dateUTC);

		if (calendarDateDiff === 0) {
			dateString = this.localize('today');
		} else if (calendarDateDiff === 1) {
			dateString = this.localize('tomorrow');
		} else if (calendarDateDiff > 1 && calendarDateDiff < 7) {
			dateString = new Date(dateUTC).toLocaleDateString(this.locale, { weekday: 'long' });
		} else {
			dateString = new Intl.DateTimeFormat(this.locale, { month: 'long', day: 'numeric' }).format(new Date(dateUTC));
		}

		return this.localize(langTerm, key, dateString);
	},

	_getAssessmentIcon: function(assessmentItem) {
		var item = this._types[(assessmentItem || {}).type];
		if (!item) {
			return '';
		}

		return typeof item.icon === 'function'
			? item.icon(assessmentItem)
			: 'd2l-tier2:' + item.icon;
	},

	_getAssessmentType: function(assessmentItem) {
		var item = this._types[assessmentItem.type];
		if (item) {
			return this.localize(item.assessmentType);
		}
		return '';
	},

	_computeCanOpenActivityDetails: function(assessmentItem, flags) {
		return this._canOpenItemType(assessmentItem, flags)
			&& !!assessmentItem.userActivityUsageHref;
	},

	_canOpenActivityDetailsUpdated: function() {
		if (!this.assessmentItem) {
			return;
		}
		var self = this;
		var event = new CustomEvent('open-immersive-page', {
			bubbles: true,
			detail: {
				pageName: 'activity-details',
				userActivityUsageHref: this.assessmentItem.userActivityUsageHref
			},
			composed: true
		});

		var onTap = function() { self.dispatchEvent(event); };
		var onKeydown = function(e) {
			if (e.keyCode === 13 || e.keyCode === 32) {
				self.dispatchEvent(event);
			}
		};

		var activityContainer = this.$$('.activity-container');
		if (this._canOpenActivityDetails) {
			activityContainer.classList.add('has-activity-details');
			activityContainer.setAttribute('role', 'link');
			activityContainer.setAttribute('tabIndex', 0);
			activityContainer.addEventListener('tap', onTap);
			activityContainer.addEventListener('keydown', onKeydown);
		} else {
			activityContainer.classList.remove('has-activity-details');
			activityContainer.removeAttribute('role', 'link');
			activityContainer.removeAttribute('tabIndex', 0);
			activityContainer.removeEventListener('tap', onTap);
			activityContainer.removeEventListener('keydown', onKeydown);
		}
	}

});
