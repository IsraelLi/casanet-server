import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {
  Operation,
  TimingTypes,
  DailySunTrigger,
  DailyTimeTrigger,
  OnceTiming,
  TimeoutTiming,
  TimingProperties
} from '../../../../../backend/src/models/sharedInterfaces';
import { Validators, FormControl } from '@angular/forms';
import { OperationService } from '../../services/operations.service';
import { Subscription } from 'rxjs';
import { TimingsService } from '../../services/timings.service';

export interface DeviceOption {
  mac: string;
  display: string;
}

@Component({
  selector: 'app-create-timing-dialog',
  templateUrl: './create-timing-dialog.component.html',
  styleUrls: ['./create-timing-dialog.component.scss']
})

export class CreateTimingDialogComponent implements OnInit {


  timingTypeControl: FormControl;
  selectOperationControl: FormControl;
  setTimingProperties: FormControl;
  nameControl: FormControl;

  timingProperties: any;
  operations: Operation[] = [];


  operationSubscription: Subscription;

  constructor(private timingsService: TimingsService,
    private operationService: OperationService,
    private dialogRef: MatDialogRef<CreateTimingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    this.selectOperationControl = new FormControl('', [Validators.required]);
    this.timingTypeControl = new FormControl('', [Validators.required]);
    this.nameControl = new FormControl('', [Validators.required]);
    this.setTimingProperties = new FormControl('');

    this.operationSubscription =
      this.operationService.operationFeed.subscribe((operations) => {
        this.operations = operations;
      });
  }

  ngOnInit() {

  }

  public isPropertiesOk() {

    const timingType: TimingTypes = this.timingTypeControl.value;

    if (timingType === 'dailySunTrigger') {
      const dailySunTrigger: DailySunTrigger = this.timingProperties;

      /** Fix duration to be number */
      dailySunTrigger.durationMinutes =
        dailySunTrigger.durationMinutes
          ? parseFloat(dailySunTrigger.durationMinutes as unknown as string)
          : undefined;
      return dailySunTrigger.days &&
        dailySunTrigger.days.length > 1 &&
        dailySunTrigger.durationMinutes &&
        dailySunTrigger.sunTrigger;
    }

    if (timingType === 'dailyTimeTrigger') {
      const dailyTimeTrigger: DailyTimeTrigger = this.timingProperties;

      dailyTimeTrigger.hour =
        dailyTimeTrigger.hour
          ? parseInt(dailyTimeTrigger.hour as unknown as string, 10)
          : undefined;


      dailyTimeTrigger.minutes =
        dailyTimeTrigger.minutes
          ? parseInt(dailyTimeTrigger.minutes as unknown as string, 10)
          : undefined;

      return dailyTimeTrigger.days &&
        dailyTimeTrigger.days.length > 1 &&
        dailyTimeTrigger.hour &&
        dailyTimeTrigger.minutes;
    }

    if (timingType === 'once') {
      const once: OnceTiming = this.timingProperties;

      const hour =
        this.timingProperties.hour
          ? parseInt(this.timingProperties.hour as unknown as string, 10)
          : 0;


      const minutes =
        this.timingProperties.minutes
          ? parseInt(this.timingProperties.minutes as unknown as string, 10)
          : 0;

      if (once['dateObj']) {
        const date: Date = once['dateObj'] as unknown as Date;
        date.setHours(hour);
        date.setMinutes(minutes);

        /** Convert it to UTC time format */
        once.date = date.getTime();
      }

      return once.date && hour && minutes;
    }

    if (timingType === 'timeout') {
      const timeoutTiming: TimeoutTiming = this.timingProperties;

      /** Fix duration to be number */
      timeoutTiming.durationInMimutes =
        timeoutTiming.durationInMimutes
          ? parseFloat(timeoutTiming.durationInMimutes as unknown as string)
          : undefined;

      /** Mark start date as 'now' */
      timeoutTiming.startDate = new Date().getTime();
      return timeoutTiming.durationInMimutes;
    }
  }

  public async createMinion() {

    /** Remove unnecessary data */
    delete this.timingProperties['dateObj'];

    const timingProperties: TimingProperties = {};

    const timingType: TimingTypes = this.timingTypeControl.value;
    timingProperties[timingType] = this.timingProperties;

    await this.timingsService.createTiming({
      timingId: 'xxx',
      isActive: true,
      timingName: this.nameControl.value,
      timingType: this.timingTypeControl.value,
      triggerOperationId: this.selectOperationControl.value.operationId,
      timingProperties,
    })

    this.operationSubscription.unsubscribe();
    this.dialogRef.close();
  }
}
