/*!
 * React Native Autolink
 *
 * Copyright 2016-2020 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/react-native-autolink/blob/master/LICENSE
 */
import React, { PureComponent, ReactNode } from "react";
import { Match } from "autolinker/dist/es2015";
import { StyleProp, Text, TextStyle, TextProps } from "react-native";
import { PropsOf } from "./types";
interface AutolinkProps<C extends React.ComponentType = React.ComponentType> {
    component?: C;
    email?: boolean;
    hashtag?: false | "facebook" | "instagram" | "twitter";
    latlng?: boolean;
    linkProps?: TextProps;
    linkStyle?: StyleProp<TextStyle>;
    mention?: false | "instagram" | "soundcloud" | "twitter";
    onPress?: (url: string, match: Match) => void;
    onLongPress?: (url: string, match: Match) => void;
    phone?: boolean | "text" | "sms";
    renderLink?: (text: string, match: Match, index: number) => React.ReactNode;
    renderText?: (text: string, index: number) => React.ReactNode;
    showAlert?: boolean;
    stripPrefix?: boolean;
    stripTrailingSlash?: boolean;
    text: string;
    textProps?: TextProps;
    truncate?: number;
    truncateChars?: string;
    truncateLocation?: "end" | "middle" | "smart";
    url?: boolean | {
        schemeMatches?: boolean;
        wwwMatches?: boolean;
        tldMatches?: boolean;
    };
    webFallback?: boolean;
}
declare type Props<C extends React.ComponentType> = AutolinkProps<C> & Omit<PropsOf<C>, keyof AutolinkProps>;
export default class Autolink<C extends React.ComponentType = typeof Text> extends PureComponent<Props<C>> {
    static truncate(text: string, { truncate, truncateChars, truncateLocation }?: {
        truncate?: number | undefined;
        truncateChars?: string | undefined;
        truncateLocation?: string | undefined;
    }): string;
    static defaultProps: {
        email: boolean;
        hashtag: boolean;
        latlng: boolean;
        linkProps: {};
        mention: boolean;
        phone: boolean;
        showAlert: boolean;
        stripPrefix: boolean;
        stripTrailingSlash: boolean;
        textProps: {};
        truncate: number;
        truncateChars: string;
        truncateLocation: string;
        url: boolean;
        webFallback: boolean;
    };
    onPress(match: Match, alertShown?: boolean): void;
    onLongPress(match: Match): void;
    getUrl(match: Match): string[];
    renderLink(text: string, match: Match, index: number, textProps?: Partial<TextProps>): ReactNode;
    render(): ReactNode;
}
export {};
