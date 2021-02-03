/*!
 * React Native Autolink
 *
 * Copyright 2016-2020 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/react-native-autolink/blob/master/LICENSE
 */
import React, { PureComponent, createElement } from "react";
import { Autolinker, AnchorTagBuilder, } from "autolinker/dist/es2015";
import { Alert, Linking, Platform, StyleSheet, Text, View, } from "react-native";
import * as Truncate from "./truncate";
import { Matchers } from "./matchers";
import { TouchableOpacity } from "react-native-gesture-handler";
const tagBuilder = new AnchorTagBuilder();
const styles = StyleSheet.create({
    link: {
        color: "#0E7AFE",
    },
});
export default class Autolink extends PureComponent {
    static truncate(text, { truncate = 32, truncateChars = "..", truncateLocation = "smart" } = {}) {
        let fn;
        switch (truncateLocation) {
            case "end":
                fn = Truncate.end;
                break;
            case "middle":
                fn = Truncate.middle;
                break;
            default:
                fn = Truncate.smart;
        }
        return fn(text, truncate, truncateChars);
    }
    onPress(match, alertShown) {
        const { onPress, showAlert, webFallback } = this.props;
        // Check if alert needs to be shown
        if (showAlert && !alertShown) {
            Alert.alert("Leaving App", "Do you want to continue?", [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => this.onPress(match, true) },
            ]);
            return;
        }
        // Get url(s) for match
        const [url, fallback] = this.getUrl(match);
        // Call custom onPress handler or open link/fallback
        if (onPress) {
            onPress(url, match);
        }
        else if (webFallback) {
            Linking.canOpenURL(url).then((supported) => {
                Linking.openURL(!supported && fallback ? fallback : url);
            });
        }
        else {
            Linking.openURL(url);
        }
    }
    onLongPress(match) {
        const { onLongPress } = this.props;
        if (onLongPress) {
            // Get url for match
            const [url] = this.getUrl(match);
            onLongPress(url, match);
        }
    }
    getUrl(match) {
        const { hashtag, mention, phone } = this.props;
        const type = match.getType();
        switch (type) {
            case "email": {
                return [
                    `mailto:${encodeURIComponent(match.getEmail())}`,
                ];
            }
            case "hashtag": {
                const tag = encodeURIComponent(match.getHashtag());
                switch (hashtag) {
                    case "facebook":
                        return [
                            `fb://hashtag/${tag}`,
                            `https://www.facebook.com/hashtag/${tag}`,
                        ];
                    case "instagram":
                        return [
                            `instagram://tag?name=${tag}`,
                            `https://www.instagram.com/explore/tags/${tag}/`,
                        ];
                    case "twitter":
                        return [
                            `twitter://search?query=%23${tag}`,
                            `https://twitter.com/hashtag/${tag}`,
                        ];
                    default:
                        return [match.getMatchedText()];
                }
            }
            case "latlng": {
                const latlng = match.getLatLng();
                const query = latlng.replace(/\s/g, "");
                return [
                    Platform.OS === "ios"
                        ? `http://maps.apple.com/?q=${encodeURIComponent(latlng)}&ll=${query}`
                        : `https://www.google.com/maps/search/?api=1&query=${query}`,
                ];
            }
            case "mention": {
                const username = match.getMention();
                switch (mention) {
                    case "instagram":
                        return [
                            `instagram://user?username=${username}`,
                            `https://www.instagram.com/${username}/`,
                        ];
                    case "soundcloud":
                        return [`https://soundcloud.com/${username}`];
                    case "twitter":
                        return [
                            `twitter://user?screen_name=${username}`,
                            `https://twitter.com/${username}`,
                        ];
                    default:
                        return [match.getMatchedText()];
                }
            }
            case "phone": {
                const number = match.getNumber();
                switch (phone) {
                    case "sms":
                    case "text":
                        return [`sms:${number}`];
                    default:
                        return [`tel:${number}`];
                }
            }
            case "url": {
                return [match.getAnchorHref()];
            }
            default: {
                return [match.getMatchedText()];
            }
        }
    }
    renderLink(text, match, index, textProps = {}) {
        const { truncate, linkStyle } = this.props;
        const truncated = truncate ? Autolink.truncate(text, this.props) : text;
        return (React.createElement(TouchableOpacity, { onPress: () => this.onPress(match), onLongPress: () => this.onLongPress(match) },
            React.createElement(Text, Object.assign({ style: linkStyle || styles.link }, textProps, { key: index }), truncated)));
    }
    render() {
        const { children, component = View, email, hashtag, latlng, linkProps, linkStyle, mention, onPress, onLongPress, phone, renderLink, renderText, showAlert, stripPrefix, stripTrailingSlash, text, textProps, truncate, truncateChars, truncateLocation, url, webFallback, ...other } = this.props;
        // Creates a token with a random UID that should not be guessable or
        // conflict with other parts of the string.
        const uid = Math.floor(Math.random() * 0x10000000000).toString(16);
        const tokenRegexp = new RegExp(`(@__ELEMENT-${uid}-\\d+__@)`, "g");
        const generateToken = (() => {
            let counter = 0;
            return () => `@__ELEMENT-${uid}-${counter++}__@`; // eslint-disable-line no-plusplus
        })();
        const matches = {};
        let linkedText;
        try {
            linkedText = Autolinker.link(text || "", {
                email,
                hashtag,
                mention,
                phone: !!phone,
                urls: url,
                stripPrefix,
                stripTrailingSlash,
                replaceFn: (match) => {
                    const token = generateToken();
                    matches[token] = match;
                    return token;
                },
            });
            // Custom matchers
            Matchers.forEach((matcher) => {
                // eslint-disable-next-line react/destructuring-assignment
                if (this.props[matcher.id]) {
                    linkedText = linkedText.replace(matcher.regex, (...args) => {
                        const token = generateToken();
                        const matchedText = args[0];
                        matches[token] = new matcher.Match({
                            tagBuilder,
                            matchedText,
                            offset: args[args.length - 2],
                            [matcher.id]: matchedText,
                        });
                        return token;
                    });
                }
            });
        }
        catch (e) {
            console.warn(e); // eslint-disable-line no-console
            return null;
        }
        const nodes = linkedText
            .split(tokenRegexp)
            .filter((part) => !!part)
            .map((part, index) => {
            const match = matches[part];
            switch (match === null || match === void 0 ? void 0 : match.getType()) {
                case "email":
                case "hashtag":
                case "latlng":
                case "mention":
                case "phone":
                case "url":
                    return renderLink
                        ? renderLink(match.getAnchorText(), match, index)
                        : this.renderLink(match.getAnchorText(), match, index, linkProps);
                default:
                    return renderText ? (renderText(part, index)) : (
                    // eslint-disable-next-line react/jsx-props-no-spreading, react/no-array-index-key
                    React.createElement(Text, Object.assign({}, textProps, { key: index }), part));
            }
        });
        return createElement(component, other, ...nodes);
    }
}
Autolink.defaultProps = {
    email: true,
    hashtag: false,
    latlng: false,
    linkProps: {},
    mention: false,
    phone: true,
    showAlert: false,
    stripPrefix: true,
    stripTrailingSlash: true,
    textProps: {},
    truncate: 32,
    truncateChars: "..",
    truncateLocation: "smart",
    url: true,
    webFallback: Platform.OS !== "ios",
};
