import asyncio

async def double(x):
    await asyncio.sleep(0)
    return x * 2

async def main():
    jobs = [double(3), double(1), double(2)]
    print(await asyncio.gather(*jobs))

if __name__ == "__main__":
    asyncio.run(main())
