import { DAYS_IN_ONE_YEAR, DAYS_IN_WEEK } from './consts'

export default class CalendarHeatmap {
  constructor (endDate, values, max, colorsAmount, colorSteps) {
    this.endDate = this._parseDate(endDate)
    this.max = max || Math.ceil((Math.max(...values.map(day => day.count)) / 5) * 4)
    this.startDate = this._shiftDate(endDate, -DAYS_IN_ONE_YEAR)
    this.values = values
    this.colorsAmount = colorsAmount
    this.steps = colorSteps
  }

  get activities () {
    return this.values.reduce((newValues, day) => {
      newValues[this._keyDayParser(day.date)] = {
        count: day.count,
        colorIndex: this.getColorIndex(day.count)
      }
      return newValues
    }, {})
  }

  get weekCount () {
    return this.getDaysCount() / DAYS_IN_WEEK
  }

  get calendar () {
    let date = this._shiftDate(this.startDate, -this.getCountEmptyDaysAtStart())
    return Array.from({ length: this.weekCount },
      () => Array.from({ length: DAYS_IN_WEEK },
        () => {
          let dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          let dayValues = this.activities[this._keyDayParser(dDate)]
          date.setDate(date.getDate() + 1)
          return {
            date: dDate,
            count: dayValues ? dayValues.count : null,
            colorIndex: dayValues ? dayValues.colorIndex : 0
          }
        }
      )
    )
  }

  get firstFullWeekOfMonths () {
    return this.calendar.reduce((months, week, index, weeks) => {
      if (index > 0) {
        let lastWeek = weeks[index - 1][0].date
        let currentWeek = week[0].date
        if (lastWeek.getFullYear() < currentWeek.getFullYear() || lastWeek.getMonth() < currentWeek.getMonth()) {
          months.push({ value: currentWeek.getMonth(), index })
        }
      }
      return months
    }, [])
  }

  getColorIndex (value) {
    // If steps are defined
    if (this.steps) {
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i]
        const from = step.from
        const to = step.to
        if (from == null && to == null) {
          if (value == null) {
            return i
          }
        } else if (from == null) {
          if (value <= to) {
            return i
          }
        } else if (to == null) {
          if (value > from) {
            return i
          }
        } else {
          if (value > from && value <= to) {
            return i
          }
        }
      }
     //
     //
     //
    } else {
      if (value == null || value === undefined) {
        return 0
      } else if (value <= 0) {
        return 1
      } else if (value >= this.max) {
        return this.colorsAmount - 1
      } else {
        // minus 3 to exclude null, 0 and over max.
        const count = this.colorsAmount - 3
        const decimal = value / this.max
        return Math.ceil(decimal * count) + 1
      }
    }
  }

  getCountEmptyDaysAtStart () {
    return this.startDate.getDay()
  }

  getCountEmptyDaysAtEnd () {
    return (DAYS_IN_WEEK - 1) - this.endDate.getDay()
  }

  getDaysCount () {
    return DAYS_IN_ONE_YEAR + 1 + this.getCountEmptyDaysAtStart() + this.getCountEmptyDaysAtEnd()
  }

  _shiftDate (date, numDays) {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + numDays)
    return newDate
  }

  _parseDate (entry) {
    return (entry instanceof Date) ? entry : (new Date(entry))
  }

  _keyDayParser (date) {
    let day = this._parseDate(date)
    return `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
  }
}
