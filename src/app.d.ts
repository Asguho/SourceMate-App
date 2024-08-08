declare global {
	namespace App {
		interface Error {
			code?: string;
			id?: string;
		}
	}
}

export {};
