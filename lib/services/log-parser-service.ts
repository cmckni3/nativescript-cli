import { DEVICE_LOG_EVENT_NAME } from "../common/constants";
import { cache } from "../common/decorators";
import { EventEmitter } from "events";

export class LogParserService extends EventEmitter implements ILogParserService {
	private parseRules: IDictionary<ILogParseRules> = {};

	constructor(private $deviceLogProvider: Mobile.IDeviceLogProvider,
		private $errors: IErrors) {
		super();
	}

	public addParseRule(rule: ILogParseRules): void {
		if(!this.parseRules[rule.name]) {
			this.$errors.failWithoutHelp("Log parse rule already exists.");
		}

		this.parseRules[rule.name] = rule;
		this.startParsingLogCore();
	}

	@cache()
	private startParsingLogCore(): void {
		this.$deviceLogProvider.on(DEVICE_LOG_EVENT_NAME, (message: string, deviceIdentifier: string) => this.processDeviceLogResponse(message, deviceIdentifier));
	}

	private processDeviceLogResponse(message: string, deviceIdentifier: string) {
		_.forEach(this.parseRules, (parseRule) => {
			const matches = parseRule.regex.exec(message);
			if (matches) {
				parseRule.handler(matches, deviceIdentifier);
			}
		});
	}
}

$injector.register("logParserService", LogParserService);
