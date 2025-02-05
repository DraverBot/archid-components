import { container } from '@sapphire/pieces';
import { err } from '@sapphire/result';
import { isNullish, isNullishOrEmpty, type NonNullObject } from '@sapphire/utilities';
import {
	Routes,
	type APIInteraction,
	type APIPingInteraction,
	type RESTGetAPIChannelResult,
	type RESTGetAPIGuildResult
} from 'discord-api-types/v10';
import type { ServerResponse } from 'node:http';
import { HttpCodes } from '../../../../api/HttpCodes';
import { resultFromDiscord } from '../../../utils/util';
import { Data, Response } from '../../common/symbols';

export type BaseInteractionType = Exclude<APIInteraction, APIPingInteraction>;

export abstract class BaseInteraction<T extends BaseInteractionType = BaseInteractionType> {
	protected readonly [Data]: T;
	protected readonly [Response]: ServerResponse;

	public constructor(response: ServerResponse, data: T) {
		this[Data] = data;
		this[Response] = response;
	}

	public get replied() {
		return this[Response].writableEnded;
	}

	/**
	 * The ID of the interaction.
	 */
	public get id(): T['id'] {
		return this[Data].id;
	}

	/**
	 * The type of the interaction.
	 */
	public get type(): T['type'] {
		return this[Data].type;
	}

	/**
	 * Bitwise set of permissions the app or bot has within the channel the interaction was sent from.
	 */
	public get app_permissions(): T['app_permissions'] {
		return this[Data].app_permissions;
	}

	/**
	 * Bitwise set of permissions the app or bot has within the channel the interaction was sent from.
	 *
	 * @seealso {@link app_permissions} for the raw data.
	 */
	public get applicationPermissions() {
		return typeof this.app_permissions === 'string' ? BigInt(this.app_permissions) : undefined;
	}

	/**
	 * The ID of the application the interaction is for.
	 */
	public get application_id(): T['application_id'] {
		return this[Data].application_id;
	}

	/**
	 * The ID of the application the interaction is for.
	 *
	 * @seealso {@link application_id} for the raw data.
	 */
	public get applicationId(): T['application_id'] {
		return this.application_id;
	}

	/**
	 * The channel the interaction was sent from.
	 */
	public get channel_id(): T['channel_id'] {
		return this[Data].channel_id;
	}

	/**
	 * The channel the interaction was sent from.
	 *
	 * @seealso {@link channel_id} for the raw data.
	 */
	public get channelId(): T['channel_id'] {
		return this.channel_id;
	}

	/**
	 * The command data payload.
	 */
	public get data(): T['data'] {
		return this[Data].data;
	}

	/**
	 * The guild the interaction was sent from.
	 */
	public get guild_id(): T['guild_id'] {
		return this[Data].guild_id;
	}

	/**
	 * The guild the interaction was sent from.
	 *
	 * @seealso {@link guild_id} for the raw data.
	 */
	public get guildId(): T['guild_id'] {
		return this.guild_id;
	}

	/**
	 * The guild's preferred locale, if invoked in a guild.
	 */
	public get guild_locale(): T['guild_locale'] {
		return this[Data].guild_locale;
	}

	/**
	 * The guild's preferred locale, if invoked in a guild.
	 *
	 * @seealso {@link guild_locale} for the raw data.
	 */
	public get guildLocale(): T['guild_locale'] {
		return this.guild_locale;
	}

	/**
	 * The selected language of the invoking user.
	 */
	public get locale(): T['locale'] {
		return this[Data].locale;
	}

	/**
	 * Guild member data for the invoking user, including permissions.
	 *
	 * **This is only sent when an interaction is invoked in a guild**.
	 */
	public get member(): T['member'] {
		return this[Data].member;
	}

	/**
	 * A continuation token for responding to the interaction.
	 */
	public get token(): T['token'] {
		return this[Data].token;
	}

	/**
	 * User object for the invoking user.
	 */
	public get user() {
		return (this[Data].member?.user ?? this[Data].user)!;
	}

	/**
	 * Read-only property, always `1`.
	 */
	public get version(): T['version'] {
		return this[Data].version;
	}

	/**
	 * Determines whether or not the interaction was sent from a guild.
	 * @returns The casted interaction type.
	 */
	public inGuild(): this is InGuild<this> {
		return !isNullish(this.guild_id);
	}

	/**
	 * Fetches the channel the interaction was sent from.
	 * @returns The fetched channel.
	 * @remarks **This requires REST to have a token.**
	 */
	public async fetchChannel() {
		if (isNullishOrEmpty(this.channelId)) return err(new Error('The interaction was not sent from a channel'));
		return resultFromDiscord(container.rest.get(Routes.channel(this.channelId)) as Promise<RESTGetAPIChannelResult>);
	}

	/**
	 * Fetches the channel the interaction was sent from.
	 * @returns The fetched channel.
	 * @remarks **This requires REST to have a token.**
	 */
	public async fetchGuild() {
		if (isNullishOrEmpty(this.guildId)) return err(new Error('The interaction was not sent from a guild'));
		return resultFromDiscord(container.rest.get(Routes.guild(this.guildId)) as Promise<RESTGetAPIGuildResult>);
	}

	protected _sendReply(data: NonNullObject) {
		const response = this[Response];
		if (response.writableEnded) throw new Error('Cannot send response, the request has already been replied.');

		response.statusCode = HttpCodes.OK;
		return new Promise<void>((resolve) => response.end(JSON.stringify(data), resolve));
	}
}

export type InGuild<T extends BaseInteraction> = T & {
	get guild_id(): NonNullable<T['guild_id']>;
	get guildId(): NonNullable<T['guildId']>;
	get guild_locale(): NonNullable<T['guild_locale']>;
	get guildLocale(): NonNullable<T['guildLocale']>;
	get member(): NonNullable<T['member']>;
};
