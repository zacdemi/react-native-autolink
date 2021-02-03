/*!
 * React Native Autolink
 *
 * Copyright 2016-2020 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/react-native-autolink/blob/master/LICENSE
 */
import { Match, MatchConfig } from 'autolinker/dist/es2015';
export interface LatLngMatchConfig extends MatchConfig {
    latlng: string;
}
export declare class LatLngMatch extends Match {
    private latlng;
    constructor(cfg: LatLngMatchConfig);
    getType(): string;
    getLatLng(): string;
    getAnchorHref(): string;
    getAnchorText(): string;
}
export declare const CustomMatchers: {
    latlng: {
        id: string;
        regex: RegExp;
        Match: typeof LatLngMatch;
    };
};
export declare type MatcherId = keyof typeof CustomMatchers;
export declare const Matchers: {
    id: string;
    regex: RegExp;
    Match: typeof LatLngMatch;
}[];
