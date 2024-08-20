import { PipeTransform, Injectable } from '@nestjs/common';
import { isArray, isObject, isString, mapValues } from 'lodash';

@Injectable()
export class TrimDataPipe implements PipeTransform {
  transform(value: any): any {
    return this.trimDeep(value);
  }

  trimDeep(data: any): any {
    switch (true) {
      case isArray(data):
        return data.map((it) => this.trimDeep(it));
      case isObject(data):
        return mapValues(data, (value) => this.trimDeep(value));
      case isString(data):
        return data.trim();
      default:
        return data;
    }
  }
}
